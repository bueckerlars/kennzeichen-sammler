import { AppDataSource } from '../config/database';
import { UserCollection } from '../models/UserCollection';
import { LicensePlate } from '../models/LicensePlate';

export class CollectionService {
  private collectionRepository = AppDataSource.getRepository(UserCollection);
  private licensePlateRepository =
    AppDataSource.getRepository(LicensePlate);

  async getUserCollection(userId: string): Promise<UserCollection[]> {
    return await this.collectionRepository.find({
      where: { userId },
      relations: ['licensePlate'],
      order: { spottedDate: 'DESC' },
    });
  }

  async addToCollection(
    userId: string,
    licensePlateId: string,
    spottedDate: Date
  ): Promise<UserCollection> {
    const existing = await this.collectionRepository.findOne({
      where: { userId, licensePlateId },
    });

    if (existing) {
      throw new Error('License plate already in collection');
    }

    const licensePlate = await this.licensePlateRepository.findOne({
      where: { id: licensePlateId },
    });

    if (!licensePlate) {
      throw new Error('License plate not found');
    }

    const collection = this.collectionRepository.create({
      userId,
      licensePlateId,
      spottedDate,
    });

    return await this.collectionRepository.save(collection);
  }

  async removeFromCollection(
    userId: string,
    collectionId: string
  ): Promise<void> {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new Error('Collection item not found');
    }

    await this.collectionRepository.remove(collection);
  }
}

