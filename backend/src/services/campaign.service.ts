import { db } from '../config/database';
import { logger } from '../utils/logger';

interface CreateCampaignDTO {
  name: string;
  message: string;
  segmentId: string;
  userId: string;
}

class CampaignService {
  async createCampaign(data: CreateCampaignDTO) {
    try {
      return await db.getPrisma().campaign.create({
        data: {
          name: data.name,
          message: data.message,
          segmentId: data.segmentId,
          userId: data.userId,
          status: 'DRAFT',
        },
      });
    } catch (error) {
      logger.error('Error creating campaign:', error);
      throw error;
    }
  }
}

export const campaignService = new CampaignService(); 