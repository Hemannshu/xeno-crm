import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  segmentIds: z.array(z.string()).optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

// Extend Express Request type to include query parameters and user
interface CustomerRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  user?: {
    id: string;
  };
}

export const customerController = {
  // Create a new customer
  async create(req: CustomerRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const data = createCustomerSchema.parse(req.body);
      const { segmentIds, ...customerData } = data;

      const customer = await prisma.customer.create({
        data: {
          ...customerData,
          userId: req.user.id,
          segments: segmentIds ? {
            connect: segmentIds.map(id => ({ id }))
          } : undefined
        },
        include: {
          segments: true,
          orders: true,
          communicationLogs: true
        }
      });

      return res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return res.status(400).json({ error: 'Email already exists' });
        }
        if (error.code === 'P2025') {
          return res.status(400).json({ error: 'One or more segments not found' });
        }
      }
      return res.status(500).json({ error: 'Failed to create customer' });
    }
  },

  // Get all customers with pagination, sorting, and filtering
  async getAll(req: CustomerRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const page = parseInt(req.query.page || '1');
      const limit = parseInt(req.query.limit || '10');
      const skip = (page - 1) * limit;
      const search = req.query.search || '';
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder || 'desc';

      const where: Prisma.CustomerWhereInput = {
        userId: req.user.id,
        OR: search ? [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ] : undefined
      };

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder
          },
          include: {
            orders: true,
            segments: true,
            communicationLogs: true
          },
        }),
        prisma.customer.count({ where })
      ]);

      return res.json({
        customers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }
  },

  // Get customer by ID
  async getById(req: CustomerRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;
      const customer = await prisma.customer.findFirst({
        where: { 
          id,
          userId: req.user.id
        },
        include: {
          orders: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          segments: true,
          communicationLogs: {
            include: {
              campaign: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      return res.json(customer);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch customer' });
    }
  },

  // Update customer
  async update(req: CustomerRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;
      const data = updateCustomerSchema.parse(req.body);
      const { segmentIds, ...customerData } = data;

      const customer = await prisma.customer.update({
        where: { 
          id,
          userId: req.user.id
        },
        data: {
          ...customerData,
          segments: segmentIds ? {
            set: segmentIds.map(id => ({ id }))
          } : undefined
        },
        include: {
          segments: true,
          orders: true,
          communicationLogs: true
        }
      });

      return res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: 'Customer not found' });
        }
        if (error.code === 'P2002') {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }
      return res.status(500).json({ error: 'Failed to update customer' });
    }
  },

  // Delete customer
  async delete(req: CustomerRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;

      // Check if customer has any orders
      const customer = await prisma.customer.findFirst({
        where: { 
          id,
          userId: req.user.id
        },
        include: {
          orders: true
        }
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      if (customer.orders.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete customer with existing orders. Please archive instead.' 
        });
      }

      await prisma.customer.delete({ 
        where: { 
          id,
          userId: req.user.id
        }
      });

      return res.status(204).send();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: 'Customer not found' });
        }
      }
      return res.status(500).json({ error: 'Failed to delete customer' });
    }
  },

  // Get customer statistics
  async getStats(req: CustomerRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const [customerCount, orderCount, recentCustomers] = await Promise.all([
        prisma.customer.count({
          where: {
            userId: req.user.id
          }
        }),
        prisma.order.count({
          where: {
            userId: req.user.id
          }
        }),
        prisma.customer.findMany({
          where: {
            userId: req.user.id
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5,
          include: {
            orders: true
          }
        })
      ]);

      return res.json({
        totalCustomers: customerCount,
        totalOrders: orderCount,
        recentCustomers
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch customer statistics' });
    }
  }
};