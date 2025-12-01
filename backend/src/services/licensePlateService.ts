import { AppDataSource } from '../config/database';
import { LicensePlate } from '../models/LicensePlate';

export class LicensePlateService {
  private licensePlateRepository =
    AppDataSource.getRepository(LicensePlate);

  async getAll(): Promise<LicensePlate[]> {
    return await this.licensePlateRepository.find({
      order: { code: 'ASC' },
    });
  }

  async search(query: string): Promise<LicensePlate[]> {
    const normalizedQuery = query.toLowerCase();

    return await this.licensePlateRepository
      .createQueryBuilder('plate')
      .where('LOWER(plate.code) LIKE :containsQuery', {
        containsQuery: `%${normalizedQuery}%`,
      })
      .orWhere('LOWER(plate.city) LIKE :containsQuery', {
        containsQuery: `%${normalizedQuery}%`,
      })
      .orWhere('LOWER(plate.state) LIKE :containsQuery', {
        containsQuery: `%${normalizedQuery}%`,
      })
      // Relevanz: exakter Code > Code beginnt mit Query > sonstige Treffer
      .addSelect(
        `CASE
          WHEN LOWER(plate.code) = :exactQuery THEN 0
          WHEN LOWER(plate.code) LIKE :prefixQuery THEN 1
          ELSE 2
        END`,
        'relevance',
      )
      .setParameters({
        exactQuery: normalizedQuery,
        prefixQuery: `${normalizedQuery}%`,
      })
      .orderBy('relevance', 'ASC')
      .addOrderBy('plate.code', 'ASC')
      .getMany();
  }

  async getById(id: string): Promise<LicensePlate | null> {
    return await this.licensePlateRepository.findOne({ where: { id } });
  }

  async getByCode(code: string): Promise<LicensePlate | null> {
    return await this.licensePlateRepository.findOne({ where: { code } });
  }
}

