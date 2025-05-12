import { logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    logger.info({
      type: 'performance',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      userAgent: req.get('user-agent'),
    });
  });

  next();
};

// Error monitoring middleware
export const errorMonitor = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    type: 'error',
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
    userAgent: req.get('user-agent'),
  });

  next(err);
};

// Database monitoring
export const dbMonitor = {
  query: (query: string, params: any[], duration: number) => {
    logger.info({
      type: 'database',
      operation: 'query',
      query,
      params,
      duration: `${duration.toFixed(2)}ms`,
    });
  },
  error: (error: Error) => {
    logger.error({
      type: 'database',
      operation: 'error',
      error: error.message,
      stack: error.stack,
    });
  },
};

// Campaign monitoring
export const campaignMonitor = {
  created: (campaignId: string, userId: string) => {
    logger.info({
      type: 'campaign',
      operation: 'created',
      campaignId,
      userId,
    });
  },
  sent: (campaignId: string, customerId: string, status: string) => {
    logger.info({
      type: 'campaign',
      operation: 'sent',
      campaignId,
      customerId,
      status,
    });
  },
  failed: (campaignId: string, customerId: string, error: string) => {
    logger.error({
      type: 'campaign',
      operation: 'failed',
      campaignId,
      customerId,
      error,
    });
  },
}; 