import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
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
});

const updateCustomerSchema = createCustomerSchema.partial();

// Extend Express Request type to include query parameters
interface CustomerRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    query?: string;
  };
}

export const customerController = {
  // Create a new customer
  async create(req: Request, res: Response) {
    try {
      const data = createCustomerSchema.parse(req.body);
      const customer = await prisma.customer.create({ data });
      return res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      } else {
        return res.status(500).json({ error: 'Failed to create customer' });
      }
    }
  },

  // Get all customers with pagination
  async getAll(req: CustomerRequest, res: Response) {
    try {
      const page = parseInt(req.query.page || '1');
      const limit = parseInt(req.query.limit || '10');
      const skip = (page - 1) * limit;

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          skip,
          take: limit,
          include: {
            orders: true,
            segments: true,
          },
        }),
        prisma.customer.count(),
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
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          orders: true,
          segments: true,
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
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateCustomerSchema.parse(req.body);

      const customer = await prisma.customer.update({
        where: { id },
        data,
      });

      return res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      } else {
        return res.status(500).json({ error: 'Failed to update customer' });
      }
    }
  },

  // Delete customer
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.customer.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete customer' });
    }
  },

  // Search customers
  async search(req: CustomerRequest, res: Response) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const customers = await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
            { phone: { contains: query } },
          ],
        },
        include: {
          orders: true,
          segments: true,
        },
      });

      return res.json(customers);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to search customers' });
    }
  },
}; 