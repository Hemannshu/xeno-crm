import { Router } from 'express';
import { AIService } from '../services/aiService';

const router = Router();

router.post('/message-suggestions', async (req, res) => {
  try {
    const { campaignObjective, targetAudience } = req.body;
    
    if (!campaignObjective || !targetAudience) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const suggestions = await AIService.generateMessageSuggestions(
      campaignObjective,
      targetAudience
    );
    
    return res.json({ suggestions });
  } catch (error) {
    console.error('Error in message suggestions endpoint:', error);
    return res.status(500).json({ error: 'Failed to generate message suggestions' });
  }
});

router.post('/campaign-summary', async (req, res) => {
  try {
    const stats = req.body;
    
    if (!stats || !stats.totalReached || !stats.delivered || !stats.failed) {
      return res.status(400).json({ error: 'Missing required statistics' });
    }

    const summary = await AIService.generateCampaignSummary(stats);
    return res.json(summary);
  } catch (error) {
    console.error('Error in campaign summary endpoint:', error);
    return res.status(500).json({ error: 'Failed to generate campaign summary' });
  }
});

export default router; 