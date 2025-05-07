import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: true,
        segments: true
      }
    });
    return res.json(customers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        orders: true,
        segments: true
      }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.json(customer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create new customer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const customer = await prisma.customer.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        postalCode: req.body.postalCode
      }
    });
    return res.status(201).json(customer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        postalCode: req.body.postalCode
      }
    });
    return res.json(customer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id }
    });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router; 