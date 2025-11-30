import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { LicensePlate } from '../models/LicensePlate';
import licensePlatesData from '../data/licensePlates.json';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const licensePlateRepository = AppDataSource.getRepository(LicensePlate);

    // Clear existing data
    await licensePlateRepository.clear();
    console.log('Cleared existing license plates');

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
    console.log(`Seeded ${licensePlates.length} license plates`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

