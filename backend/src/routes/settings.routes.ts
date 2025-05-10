// import express from 'express';
import {Router} from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Profile settings
router.put('/profile', settingsController.updateProfile);

// Company settings
router.put('/company', settingsController.updateCompany);

// Notification settings
router.put('/notifications', settingsController.updateNotifications);

export default router; 