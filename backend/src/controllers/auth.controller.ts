import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { logger } from '../utils/logger';
import { ValidationError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface RegisterDTO {
  email: string;
  password: string;
  name?: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  return jwt.sign(
    { userId },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
};

class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name }: RegisterDTO = req.body;

      // Validate input
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Check if user already exists
      const existingUser = await db.getPrisma().user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ValidationError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await db.getPrisma().user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      // Generate JWT token
      const token = generateToken(user.id);

      logger.info(`User registered: ${user.id}`);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password }: LoginDTO = req.body;

      // Validate input
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Find user
      const user = await db.getPrisma().user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new ValidationError('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password || '');

      if (!isValidPassword) {
        throw new ValidationError('Invalid email or password');
      }

      // Generate JWT token
      const token = generateToken(user.id);

      logger.info(`User logged in: ${user.id}`);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController(); 