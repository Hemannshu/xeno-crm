import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

class Database {
  private static instance: Database;
  private prisma: PrismaClient;
  private connected: boolean = false;

  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'stdout',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async connect(): Promise<void> {
    try {
      logger.info('Attempting to connect to database...');
      await this.prisma.$connect();
      this.connected = true;
      logger.info('Database connected successfully');
      
      // Test the connection
      await this.prisma.$queryRaw`SELECT 1`;
      logger.info('Database connection test successful');
    } catch (error) {
      this.connected = false;
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.connected = false;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Database disconnection failed:', error);
      throw error;
    }
  }
}

export const db = Database.getInstance(); 