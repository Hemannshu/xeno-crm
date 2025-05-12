import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CampaignController {
  async createCampaign(req: Request, res: Response) {
    try {
      const { name, message, segmentId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Verify segment exists
      const segment = await prisma.segment.findUnique({
        where: { id: segmentId }
      });

      if (!segment) {
        return res.status(404).json({ error: 'Segment not found' });
      }

      const campaign = await prisma.campaign.create({
        data: {
          name,
          message,
          status: 'DRAFT',
          userId,
          segmentId
        },
        include: {
          createdBy: true,
          segment: true
        }
      });

      return res.status(201).json(campaign);
    } catch (error) {
      console.error('Campaign creation error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint')) {
          return res.status(409).json({ error: 'Campaign with this name already exists' });
        }
      }

      return res.status(500).json({ 
        error: 'Failed to create campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getCampaignStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Verify campaign exists and belongs to user
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id,
          userId
        }
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      const logs = await prisma.communicationLog.findMany({
        where: { campaignId: id }
      });

      const stats = {
        totalSent: logs.filter(log => log.status === 'SENT').length,
        totalFailed: logs.filter(log => log.status === 'FAILED').length,
        deliveryRate: logs.length ? (logs.filter(log => log.status === 'SENT').length / logs.length) * 100 : 0
      };

      return res.json(stats);
    } catch (error) {
      console.error('Campaign stats error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch campaign stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 