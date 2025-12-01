import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CollectionService } from '../services/collectionService';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

const collectionService = new CollectionService();

export class CollectionController {
  async getUserCollection(req: AuthRequest, res: Response) {
    try {
      const collections = await collectionService.getUserCollection(
        req.userId!
      );
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch collection' });
    }
  }

  async getUserCollectionByUserId(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const userRepository = AppDataSource.getRepository(User);
      
      // Check if user exists
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const collections = await collectionService.getUserCollection(userId);
      res.json({ collections, username: user.username });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch collection' });
    }
  }

  async addToCollection(req: AuthRequest, res: Response) {
    try {
      const { licensePlateId, spottedDate } = req.body;

      if (!licensePlateId) {
        return res
          .status(400)
          .json({ error: 'License plate ID required' });
      }

      const date = spottedDate
        ? new Date(spottedDate)
        : new Date();

      const collection = await collectionService.addToCollection(
        req.userId!,
        licensePlateId,
        date
      );

      res.status(201).json(collection);
    } catch (error: any) {
      if (error.message === 'License plate already in collection') {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === 'License plate not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to add to collection' });
    }
  }

  async removeFromCollection(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await collectionService.removeFromCollection(req.userId!, id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Collection item not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to remove from collection' });
    }
  }
}

