import { Router } from 'express';
import { CollectionController } from '../controllers/collectionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const collectionController = new CollectionController();

router.use(authMiddleware);

router.get(
  '/',
  collectionController.getUserCollection.bind(collectionController)
);
router.get(
  '/user/:userId',
  collectionController.getUserCollectionByUserId.bind(collectionController)
);
router.post(
  '/',
  collectionController.addToCollection.bind(collectionController)
);
router.delete(
  '/:id',
  collectionController.removeFromCollection.bind(collectionController)
);

export default router;

