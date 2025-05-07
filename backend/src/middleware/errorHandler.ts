import { Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: unknown,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error:', err);

  // Default to 500 if no status code is set
  const statusCode = (err as any).statusCode || 500;
  
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode
    }
  });
}; 