import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { segmentService } from '../services/segment.service';
import { AuthUser } from '../types/user';

export class SegmentController {
  private validateUser(req: Request): string {
    const user = req.user as AuthUser;
    if (!user?.id) {
      throw new ValidationError('User not authenticated');
    }
    return user.id;
  }

  createSegment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, rules } = req.body;
      const userId = this.validateUser(req);

      if (!name || !rules || !Array.isArray(rules)) {
        throw new ValidationError('Invalid segment data');
      }

      const segment = await segmentService.createSegment({
        name,
        rules,
        userId,
      });

      res.status(201).json({
        status: 'success',
        data: segment,
      });
    } catch (error) {
      next(error);
    }
  }

  listSegments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.validateUser(req);
      const segments = await segmentService.listSegments(userId);
      
      res.json({
        status: 'success',
        data: segments,
      });
    } catch (error) {
      next(error);
    }
  }

  getSegment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = this.validateUser(req);

      const segment = await segmentService.getSegment(id, userId);
      res.json({
        status: 'success',
        data: segment,
      });
    } catch (error) {
      next(error);
    }
  }

  updateSegment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, rules } = req.body;
      const userId = this.validateUser(req);

      const segment = await segmentService.updateSegment(id, userId, {
        name,
        rules,
      });

      res.json({
        status: 'success',
        data: segment,
      });
    } catch (error) {
      next(error);
    }
  }

  deleteSegment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = this.validateUser(req);

      await segmentService.deleteSegment(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const segmentController = new SegmentController(); 