import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { authController } from '../controllers/auth.controller';
import { db } from '../config/database';
import { AuthUser } from '../types/user';

const router = Router();

// Session check endpoint
router.get('/session', (req: Request, res: Response) => {
  // Check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as AuthUser;
      return res.json({
        authenticated: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name
        }
      });
    } catch (error) {
      // Token verification failed, continue to session check
    }
  }

  // Check session-based authentication
  if (req.isAuthenticated()) {
    const user = req.user as AuthUser;
    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  }

  return res.status(401).json({
    authenticated: false,
    message: 'Not authenticated'
  });
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as import('../types/user').AuthUser;
      if (!user) {
        return res.redirect('/login?error=no_user');
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Redirect to frontend with token
      return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      return res.redirect('/login?error=auth_failed');
    }
  }
);

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Google OAuth POST endpoint
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { googleId, email, name } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // First try to find user by googleId
    let user = await db.getPrisma().user.findUnique({
      where: { googleId }
    });

    if (!user) {
      // If not found by googleId, try to find by email
      user = await db.getPrisma().user.findUnique({
        where: { email }
      });

      if (user) {
        // If user exists with email but no googleId, update with googleId
        user = await db.getPrisma().user.update({
          where: { email },
          data: { googleId }
        });
      } else {
        // Create new user if not found by either googleId or email
        user = await db.getPrisma().user.create({
          data: {
            email,
            name,
            googleId
          }
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Set up session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name || ''
    };

    return res.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

export const authRoutes = router; 