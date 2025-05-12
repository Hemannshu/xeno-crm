import { Request, Response, NextFunction } from 'express';

export const validateCampaign = (req: Request, res: Response, next: NextFunction): void => {
  const { name, message, segmentId } = req.body;
  
  if (!name || !message || !segmentId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  
  next();
}; 