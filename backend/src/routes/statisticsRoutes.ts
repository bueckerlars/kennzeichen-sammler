import { Router } from 'express';
import { StatisticsController } from '../controllers/statisticsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const statisticsController = new StatisticsController();

router.use(authMiddleware);

router.get(
  '/',
  statisticsController.getUserStatistics.bind(statisticsController)
);
router.get(
  '/leaderboard',
  statisticsController.getLeaderboard.bind(statisticsController)
);

export default router;

