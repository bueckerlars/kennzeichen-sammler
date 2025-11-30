import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { LicensePlate } from '../models/LicensePlate';
import * as fs from 'fs';
import * as path from 'path';

export async function seedDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const licensePlateRepository = AppDataSource.getRepository(LicensePlate);
    
    // Check if data already exists
    const count = await licensePlateRepository.count();
    if (count > 0) {
      console.log(`Database already seeded with ${count} license plates`);
      return;
    }

    console.log('Starting database seed...');

    // Load license plates data
    // Try multiple paths to find the JSON file
    const possiblePaths = [
      path.join(__dirname, '../data/licensePlates.json'), // Compiled: dist/data/licensePlates.json
      path.join(process.cwd(), 'src/data/licensePlates.json'), // Development
      path.join(process.cwd(), 'dist/data/licensePlates.json'), // Production compiled
      '/app/src/data/licensePlates.json', // Docker absolute path
    ];
    
    let licensePlatesData: any[] | null = null;
    let lastError: Error | null = null;
    
    for (const dataPath of possiblePaths) {
      try {
        console.log(`Trying to load data from: ${dataPath}`);
        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        licensePlatesData = JSON.parse(fileContent);
        console.log(`Successfully loaded data from: ${dataPath}`);
        break;
      } catch (error) {
        lastError = error as Error;
        continue;
      }
    }
    
    if (!licensePlatesData) {
      console.error('Failed to load license plates data from all paths:', possiblePaths);
      throw new Error(`Could not load license plates data: ${lastError?.message}`);
    }

    // Insert all license plates
    const licensePlates = licensePlatesData.map((plate: any) =>
      licensePlateRepository.create({
        code: plate.code,
        city: plate.city,
        region: plate.region || null,
        state: plate.state,
      })
    );

    await licensePlateRepository.save(licensePlates);
    console.log(`Successfully seeded ${licensePlates.length} license plates`);
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
}

