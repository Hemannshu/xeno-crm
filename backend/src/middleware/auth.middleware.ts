import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { AuthUser } from '../types/user';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ValidationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new ValidationError('Invalid token format');
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as AuthUser;

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ValidationError('Invalid token'));
    } else {
      logger.error('Authentication error:', error);
      next(error);
    }
  }
}; 