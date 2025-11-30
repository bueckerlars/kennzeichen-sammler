import { Request, Response } from 'express';
import { LicensePlateService } from '../services/licensePlateService';

const licensePlateService = new LicensePlateService();

export class LicensePlateController {
  async getAll(req: Request, res: Response) {
    try {
      const plates = await licensePlateService.getAll();
      res.json(plates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch license plates' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter required' });
      }
      const plates = await licensePlateService.search(query);
      res.json(plates);
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  }
}

