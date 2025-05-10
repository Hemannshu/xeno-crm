import { Request, Response } from 'express';
import { db } from '../config/database';
import bcrypt from 'bcrypt';

export const settingsController = {
  async updateProfile(req: Request, res: Response) {
    try {
      const { name, email,currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // If changing password, verify current password
      if (currentPassword && newPassword) {
        const user = await db.getPrisma().user.findUnique({
          where: { id: userId },
          select: { password: true },
        });

        if (!user || !user.password) {
          return res.status(404).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user with new password
        await db.getPrisma().user.update({
          where: { id: userId },
          data: {
            password: hashedPassword,
            name,
            email,
          },
        });
      } else {
        // Update user without changing password
        await db.getPrisma().user.update({
          where: { id: userId },
          data: {
            name,
            email,
          },
        });
      }

      return res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }
  },

  

  
}; 