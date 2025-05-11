import { db } from '../config/database';
import { NotFoundError } from '../utils/errors'; // Removed unused ValidationError
import { logger } from '../utils/logger';
import { Prisma } from '@prisma/client';
import { campaignService } from './campaign.service';

interface Rule {
  field: string;
  operator: string;
  value: any;
}

interface CreateSegmentDTO {
  name: string;
  rules: Rule[];
  userId: string;
}

interface UpdateSegmentDTO {
  name?: string;
  rules?: Rule[];
}

class SegmentService {
  private convertRulesToJson(rules: Rule[]): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(rules));
  }

  async createSegment(data: CreateSegmentDTO) {
    try {
      const audienceSize = await this.calculateAudienceSize(data.rules);

      const segment = await db.getPrisma().segment.create({
        data: {
          name: data.name,
          rules: this.convertRulesToJson(data.rules),
          audienceSize,
          userId: data.userId,
        },
      });

      // Create a default campaign for the segment
      await campaignService.createCampaign({
        name: `Welcome Campaign - ${segment.name}`,
        message: "Hi {name}, here's 10% off on your next order!",
        segmentId: segment.id,
        userId: data.userId,
      });

      return segment;
    } catch (error) {
      logger.error('Error creating segment:', error);
      throw error;
    }
  }

  async getSegment(id: string, userId: string) {
    const segment = await db.getPrisma().segment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!segment) {
      throw new NotFoundError('Segment not found');
    }

    return segment;
  }

  async updateSegment(id: string, userId: string, data: UpdateSegmentDTO) {
    await this.getSegment(id, userId); // Verify segment exists

    try {
      return await db.getPrisma().segment.update({
        where: { id },
        data: {
          name: data.name,
          rules: data.rules ? this.convertRulesToJson(data.rules) : undefined,
          audienceSize: data.rules ? await this.calculateAudienceSize(data.rules) : undefined,
        },
      });
    } catch (error) {
      logger.error('Error updating segment:', error);
      throw error;
    }
  }

  async deleteSegment(id: string, userId: string) {
    await this.getSegment(id, userId); // Verify segment exists

    try {
      await db.getPrisma().segment.delete({
        where: { id },
      });
      logger.info(`Segment deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting segment:', error);
      throw error;
    }
  }

  async listSegments(userId: string) {
    try {
      return await db.getPrisma().segment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error listing segments:', error);
      throw error;
    }
  }

  private async calculateAudienceSize(rules: Rule[]): Promise<number> {
    // TODO: Implement actual audience size calculation based on rules
    return Math.floor(Math.random() * 1000);
  }
}

export const segmentService = new SegmentService();