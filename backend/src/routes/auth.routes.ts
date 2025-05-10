import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { authController } from '../controllers/auth.controller';
import { db } from '../config/database';
import { AuthUser } from '../types/user';
import bcrypt from 'bcrypt';

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
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          googleId: !googleId ? 'Google ID is required' : undefined,
          email: !email ? 'Email is required' : undefined
        }
      });
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
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          error: 'Account already exists',
          message: 'An account with this email already exists'
        });
      }
      
      if (error.message.includes('Invalid credentials')) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          message: 'The provided credentials are invalid'
        });
      }
    }

    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An unexpected error occurred during authentication'
    });
  }
});

// Add token refresh endpoint
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Missing refresh token',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key') as AuthUser;
    
    // Generate new access token
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return res.json({
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Refresh token has expired'
      });
    }

    return res.status(401).json({
      error: 'Invalid refresh token',
      message: 'The refresh token is invalid'
    });
  }
});

// Add remember me functionality
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await db.getPrisma().user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Verify password (assuming you have password hashing implemented)
    if (!user.password) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Generate tokens with different expiration based on remember me
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: rememberMe ? '7d' : '24h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '30d' }
    );

    // Set up session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name || ''
    };

    // Set session cookie options based on remember me
    if (rememberMe) {
      req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid credentials')) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Invalid email or password'
        });
      }
    }

    return res.status(500).json({
      error: 'Login failed',
      message: 'An unexpected error occurred during login'
    });
  }
});

export const authRoutes = router; 