import { Router } from 'express';
import { LicensePlateController } from '../controllers/licensePlateController';

const router = Router();
const licensePlateController = new LicensePlateController();

router.get('/', licensePlateController.getAll.bind(licensePlateController));
router.get(
  '/search',
  licensePlateController.search.bind(licensePlateController)
);

export default router;

