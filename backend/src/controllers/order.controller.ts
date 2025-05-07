import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createOrderSchema = z.object({
  orderNumber: z.string(),
  totalAmount: z.number().positive(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
  paymentMethod: z.string().optional(),
  customerId: z.string(),
});

const updateOrderSchema = createOrderSchema.partial();

// Extend Express Request type to include query parameters
interface OrderRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    query?: string;
    status?: string;
  };
}

export const orderController = {
  // Create a new order
  async create(req: Request, res: Response) {
    try {
      const data = createOrderSchema.parse(req.body);
      const order = await prisma.order.create({ data });
      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      } else {
        return res.status(500).json({ error: 'Failed to create order' });
      }
    }
  },

  // Get all orders with pagination
  async getAll(req: OrderRequest, res: Response) {
    try {
      const page = parseInt(req.query.page || '1');
      const limit = parseInt(req.query.limit || '10');
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          skip,
          take: limit,
          include: {
            customer: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.order.count(),
      ]);

      return res.json({
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  // Get order by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: true,
        },
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.json(order);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
  },

  // Update order
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateOrderSchema.parse(req.body);

      const order = await prisma.order.update({
        where: { id },
        data,
        include: {
          customer: true,
        },
      });

      return res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      } else {
        return res.status(500).json({ error: 'Failed to update order' });
      }
    }
  },

  // Delete order
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.order.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete order' });
    }
  },

  // Get orders by customer ID
  async getByCustomerId(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const orders = await prisma.order.findMany({
        where: { customerId },
        include: {
          customer: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.json(orders);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch customer orders' });
    }
  },

  // Get order statistics
  async getStats(req: Request, res: Response) {
    try {
      const stats = await prisma.order.groupBy({
        by: ['status'],
        _count: true,
        _sum: {
          totalAmount: true,
        },
      });

      return res.json(stats);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch order statistics' });
    }
  },
}; 