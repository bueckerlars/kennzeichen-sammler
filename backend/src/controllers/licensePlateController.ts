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

      // Parse pagination parameters - only use defaults if explicitly provided
      const hasPage = req.query.page !== undefined;
      const hasLimit = req.query.limit !== undefined;
      
      let page = 1;
      let limit = 20;
      
      if (hasPage) {
        page = parseInt(req.query.page as string) || 1;
      }
      if (hasLimit) {
        limit = parseInt(req.query.limit as string) || 20;
      }

      // If no pagination params provided, return all results but still with total count
      // Use a very high limit to get all results
      if (!hasPage && !hasLimit) {
        limit = 10000; // High enough to get all results
      }

      // Validate parameters
      if (page < 1) {
        return res.status(400).json({ error: 'Page must be greater than 0' });
      }
      if (limit < 1 || limit > 10000) {
        return res.status(400).json({ error: 'Limit must be between 1 and 10000' });
      }

      const result = await licensePlateService.search(query, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  }
}

