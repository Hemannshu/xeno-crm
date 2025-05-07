import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.create({
      data: {
        orderNumber: req.body.orderNumber,
        totalAmount: req.body.totalAmount,
        status: req.body.status || 'PENDING',
        paymentMethod: req.body.paymentMethod,
        customerId: req.body.customerId
      },
      include: {
        customer: true
      }
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        orderNumber: req.body.orderNumber,
        totalAmount: req.body.totalAmount,
        status: req.body.status,
        paymentMethod: req.body.paymentMethod,
        customerId: req.body.customerId
      },
      include: {
        customer: true
      }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete order
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.order.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Get orders by customer ID
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.params.customerId },
      include: {
        customer: true
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

export default router; 