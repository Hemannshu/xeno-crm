import express, { RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import session from 'express-session';
import passport from './config/passport';
import { db } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { logger, stream } from './utils/logger';
import { segmentRoutes } from './routes/segment.routes';
import { authRoutes } from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import orderRoutes from './routes/order.routes';
import campaignRoutes from './routes/campaign.routes';

// Load environment variables
config();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Logging middleware
app.use(morgan('combined', { stream }));

// Request logging
const requestLogger: RequestHandler = (req, _, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
};
app.use(requestLogger);

// Health check route
const healthCheck: RequestHandler = (_, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};
app.get('/health', healthCheck);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/campaigns', campaignRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env.PORT || '3001', 10);

const startServer = async () => {
  try {
    // Connect to database
    await db.connect();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await db.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await db.disconnect();
  process.exit(0);
});

// Start the server
startServer();