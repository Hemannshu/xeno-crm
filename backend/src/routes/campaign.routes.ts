import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all campaigns
router.get('/', authenticateToken, async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        createdBy: true,
        segment: true,
        logs: true
      }
    });
    return res.json(campaigns);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get campaign by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: true,
        segment: true,
        logs: true
      }
    });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    return res.json(campaign);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Create new campaign
router.post('/', authenticateToken, async (req, res) => {
  try {
    const campaign = await prisma.campaign.create({
      data: {
        name: req.body.name,
        message: req.body.message,
        status: 'DRAFT',
        userId: req.user!.id,
        segmentId: req.body.segmentId
      },
      include: {
        createdBy: true,
        segment: true
      }
    });
    return res.status(201).json(campaign);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update campaign
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        message: req.body.message,
        status: req.body.status,
        segmentId: req.body.segmentId
      },
      include: {
        createdBy: true,
        segment: true
      }
    });
    return res.json(campaign);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Delete campaign
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.campaign.delete({
      where: { id: req.params.id }
    });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// Start campaign delivery
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        segment: {
          include: {
            customers: true
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Update campaign status
    await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: 'SENDING' }
    });

    // Create communication logs for each customer
    const logs = await Promise.all(
      campaign.segment.customers.map(customer =>
        prisma.communicationLog.create({
          data: {
            campaignId: campaign.id,
            customerId: customer.id,
            status: 'PENDING'
          }
        })
      )
    );

    // Start delivery process (this would typically be handled by a queue system)
    // For now, we'll simulate immediate delivery
    for (const log of logs) {
      try {
        // Simulate delivery to customer
        await prisma.communicationLog.update({
          where: { id: log.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        });
      } catch (error) {
        await prisma.communicationLog.update({
          where: { id: log.id },
          data: {
            status: 'FAILED',
            error: 'Delivery failed'
          }
        });
      }
    }

    return res.json({ message: 'Campaign delivery started', logs });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to start campaign delivery' });
  }
});

export default router; 