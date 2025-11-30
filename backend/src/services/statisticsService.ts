import { AppDataSource } from '../config/database';
import { LicensePlate } from '../models/LicensePlate';
import { UserCollection } from '../models/UserCollection';

export class StatisticsService {
  private licensePlateRepository =
    AppDataSource.getRepository(LicensePlate);
  private collectionRepository = AppDataSource.getRepository(UserCollection);

  async getUserStatistics(userId: string) {
    const totalPlates = await this.licensePlateRepository.count();
    const collectedPlates = await this.collectionRepository.count({
      where: { userId },
    });
    const missingPlates = totalPlates - collectedPlates;

    const collectedByState = await this.collectionRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.licensePlate', 'plate')
      .where('collection.userId = :userId', { userId })
      .select('plate.state', 'state')
      .addSelect('COUNT(*)', 'count')
      .groupBy('plate.state')
      .getRawMany();

    const allStates = await this.licensePlateRepository
      .createQueryBuilder('plate')
      .select('plate.state', 'state')
      .addSelect('COUNT(*)', 'total')
      .groupBy('plate.state')
      .getRawMany();

    const stateStats = allStates.map((stateData) => {
      const collected = collectedByState.find(
        (c) => c.state === stateData.state
      );
      return {
        state: stateData.state,
        total: parseInt(stateData.total),
        collected: collected ? parseInt(collected.count) : 0,
        missing:
          parseInt(stateData.total) - (collected ? parseInt(collected.count) : 0),
      };
    });

    return {
      total: totalPlates,
      collected: collectedPlates,
      missing: missingPlates,
      percentage: totalPlates > 0 ? (collectedPlates / totalPlates) * 100 : 0,
      byState: stateStats,
    };
  }

  async getLeaderboard() {
    const leaderboard = await this.collectionRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.user', 'user')
      .select('user.id', 'userId')
      .addSelect('user.username', 'username')
      .addSelect('COUNT(DISTINCT collection.licensePlateId)', 'count')
      .groupBy('user.id')
      .addGroupBy('user.username')
      .orderBy('count', 'DESC')
      .limit(100)
      .getRawMany();

    return leaderboard.map((entry) => ({
      userId: entry.userId,
      username: entry.username,
      count: parseInt(entry.count),
    }));
  }
}

