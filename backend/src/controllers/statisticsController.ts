import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { StatisticsService } from '../services/statisticsService';

const statisticsService = new StatisticsService();

export class StatisticsController {
  async getUserStatistics(req: AuthRequest, res: Response) {
    try {
      const stats = await statisticsService.getUserStatistics(req.userId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  async getLeaderboard(req: AuthRequest, res: Response) {
    try {
      const leaderboard = await statisticsService.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }
}

