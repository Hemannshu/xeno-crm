import { Router } from 'express';
import { segmentController } from '../controllers/segment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protected routes - require authentication
router.use(authenticate);

// Segment routes
router.post('/', segmentController.createSegment);
router.get('/', segmentController.listSegments);
router.get('/:id', segmentController.getSegment);
router.put('/:id', segmentController.updateSegment);
router.delete('/:id', segmentController.deleteSegment);

export const segmentRoutes = router; 