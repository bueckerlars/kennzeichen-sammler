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
    return await this.licensePlateRepository
      .createQueryBuilder('plate')
      .where('plate.code LIKE :query', { query: `%${query}%` })
      .orWhere('plate.city LIKE :query', { query: `%${query}%` })
      .orWhere('plate.state LIKE :query', { query: `%${query}%` })
      .orderBy('plate.code', 'ASC')
      .getMany();
  }

  async getById(id: string): Promise<LicensePlate | null> {
    return await this.licensePlateRepository.findOne({ where: { id } });
  }

  async getByCode(code: string): Promise<LicensePlate | null> {
    return await this.licensePlateRepository.findOne({ where: { code } });
  }
}

