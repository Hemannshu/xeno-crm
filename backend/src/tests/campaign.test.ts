import request from 'supertest';
import { app } from '../index';
import { testUtils } from './setup';
import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import type { Express } from 'express';

describe('Campaign API', () => {
  let testUser: any;
  let testCustomer: any;
  let testSegment: any;
  let authToken: string;

  beforeEach(async () => {
    // Setup test database
    await testUtils.setup();
    
    // Create test user
    testUser = await testUtils.createTestUser();
    
    // Create test customer
    testCustomer = await testUtils.createTestCustomer(testUser.id);
    
    // Create test segment
    testSegment = await testUtils.createTestSegment(testUser.id);
    
    // Mock authentication
    authToken = 'test-token';
  });

  afterAll(async () => {
    await testUtils.teardown();
  });

  describe('POST /api/campaigns', () => {
    it('should create a new campaign', async () => {
      const campaignData = {
        name: 'Test Campaign',
        message: 'Test message',
        segmentId: testSegment.id,
      };

      const response = await request(app as unknown as Express)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(campaignData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(campaignData.name);
    });

    it('should validate required fields', async () => {
      const response = await request(app as unknown as Express)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/campaigns/:id/stats', () => {
    it('should return campaign statistics', async () => {
      // Create a campaign first
      const campaign = await testUtils.prisma.campaign.create({
        data: {
          name: 'Test Campaign',
          message: 'Test message',
          status: 'COMPLETED',
          userId: testUser.id,
          segmentId: testSegment.id,
        },
      });

      // Create some communication logs
      await testUtils.prisma.communicationLog.create({
        data: {
          campaignId: campaign.id,
          customerId: testCustomer.id,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      const response = await request(app as unknown as Express)
        .get(`/api/campaigns/${campaign.id}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalSent');
      expect(response.body).toHaveProperty('totalFailed');
      expect(response.body).toHaveProperty('deliveryRate');
    });
  });
}); 