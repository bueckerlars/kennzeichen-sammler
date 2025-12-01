import { AppDataSource } from '../config/database';
import { LicensePlate } from '../models/LicensePlate';

export interface SearchResult {
  data: LicensePlate[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Normalizes a search query by:
 * - Trimming whitespace
 * - Normalizing umlauts (ä→ae, ö→oe, ü→ue, ß→ss)
 * - Collapsing multiple whitespaces to single space
 * - Converting to lowercase
 */
function normalizeQuery(query: string): string {
  return query
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Calculates the Levenshtein distance between two strings
 * Returns the minimum number of single-character edits needed to transform str1 into str2
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculates the maximum allowed Levenshtein distance for fuzzy matching
 * Based on query length: shorter queries allow less distance
 */
function getMaxDistance(query: string): number {
  const length = query.length;
  if (length <= 2) return 0;  // No fuzzy for very short queries
  if (length <= 4) return 1;  // Allow 1 error for short queries
  if (length <= 8) return 2;  // Allow 2 errors for medium queries
  return 3;                    // Allow 3 errors for long queries
}

export class LicensePlateService {
  private licensePlateRepository =
    AppDataSource.getRepository(LicensePlate);

  async getAll(): Promise<LicensePlate[]> {
    return await this.licensePlateRepository.find({
      order: { code: 'ASC' },
    });
  }

  async search(query: string, page: number = 1, limit: number = 20): Promise<SearchResult> {
    // Normalize and trim query
    const normalizedQuery = normalizeQuery(query);
    
    // Return empty results if query is empty after normalization
    if (!normalizedQuery) {
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }

    const skip = (page - 1) * limit;
    const maxDistance = getMaxDistance(normalizedQuery);

    // For fuzzy search or when we need normalized matching, we need to load all plates
    // and filter in memory. For simple queries without fuzzy, we can use SQL LIKE.
    // We'll use a hybrid approach: try SQL first, then fall back to in-memory if needed.
    
    let allPlates: LicensePlate[];
    
    if (maxDistance === 0) {
      // No fuzzy search needed, use fast SQL query
      const queryBuilder = this.licensePlateRepository
        .createQueryBuilder('plate')
        .where('LOWER(plate.code) LIKE :containsQuery', {
          containsQuery: `%${normalizedQuery}%`,
        })
        .orWhere('LOWER(plate.city) LIKE :containsQuery', {
          containsQuery: `%${normalizedQuery}%`,
        })
        .orWhere('LOWER(plate.state) LIKE :containsQuery', {
          containsQuery: `%${normalizedQuery}%`,
        });
      
      allPlates = await queryBuilder.getMany();
    } else {
      // Fuzzy search needed - load all plates to normalize and match in memory
      // This is necessary because SQL LIKE doesn't handle normalized umlauts
      allPlates = await this.licensePlateRepository.find();
    }

    // Calculate relevance scores for each plate
    interface ScoredPlate {
      plate: LicensePlate;
      score: number;
      distance?: number;
    }

    const scoredPlates: ScoredPlate[] = allPlates.map((plate) => {
      const codeLower = normalizeQuery(plate.code);
      const cityLower = normalizeQuery(plate.city);
      const stateLower = normalizeQuery(plate.state);

      // Check for exact matches
      if (codeLower === normalizedQuery) {
        return { plate, score: 0 };
      }

      // Check for prefix matches
      if (codeLower.startsWith(normalizedQuery)) {
        return { plate, score: 1 };
      }
      if (cityLower.startsWith(normalizedQuery) || stateLower.startsWith(normalizedQuery)) {
        return { plate, score: 1.5 };
      }

      // Check for contains matches
      if (codeLower.includes(normalizedQuery)) {
        return { plate, score: 2 };
      }
      if (cityLower.includes(normalizedQuery) || stateLower.includes(normalizedQuery)) {
        return { plate, score: 2.5 };
      }

      // Apply fuzzy search if maxDistance > 0
      if (maxDistance > 0) {
        const codeDistance = levenshteinDistance(normalizedQuery, codeLower);
        const cityDistance = levenshteinDistance(normalizedQuery, cityLower);
        const stateDistance = levenshteinDistance(normalizedQuery, stateLower);

        const minDistance = Math.min(codeDistance, cityDistance, stateDistance);

        if (minDistance <= maxDistance) {
          // Score: 3 + distance (lower is better, so 3 + 1 = 4 for distance 1)
          return { plate, score: 3 + minDistance, distance: minDistance };
        }
      }

      // No match
      return { plate, score: Infinity };
    });

    // Filter out non-matches and sort by relevance
    const matchedPlates = scoredPlates
      .filter((sp) => sp.score !== Infinity)
      .sort((a, b) => {
        // Sort by score (lower is better)
        if (a.score !== b.score) {
          return a.score - b.score;
        }
        // If scores are equal, sort alphabetically by code
        return a.plate.code.localeCompare(b.plate.code);
      })
      .map((sp) => sp.plate);

    // Apply pagination
    const total = matchedPlates.length;
    const data = matchedPlates.slice(skip, skip + limit);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getById(id: string): Promise<LicensePlate | null> {
    return await this.licensePlateRepository.findOne({ where: { id } });
  }

  async getByCode(code: string): Promise<LicensePlate | null> {
    return await this.licensePlateRepository.findOne({ where: { code } });
  }
}

