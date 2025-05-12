import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load test environment variables
config({ path: '.env.test' });

// Create a new Prisma client for testing
const prisma = new PrismaClient();

// Export test utilities
export const testUtils = {
  prisma,
  setup: async () => {
    // Clean up database before tests
    await prisma.communicationLog.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.segment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
  },
  teardown: async () => {
    await prisma.$disconnect();
  },
  createTestUser: async () => {
    return prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
  },
  createTestCustomer: async (userId: string) => {
    return prisma.customer.create({
      data: {
        email: 'customer@example.com',
        name: 'Test Customer',
        userId,
      },
    });
  },
  createTestSegment: async (userId: string) => {
    return prisma.segment.create({
      data: {
        name: 'Test Segment',
        rules: {
          operator: 'AND',
          conditions: [
            {
              field: 'totalSpent',
              operator: '>',
              value: 1000,
            },
          ],
        },
        userId,
        audienceSize: 0,
      },
    });
  },
}; 