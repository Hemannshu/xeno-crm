import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { orderController } from '../controllers/order.controller';

// Define the request type with query parameters
interface OrderRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    query?: string;
    status?: string;
  };
}

const router = Router();

// Get all orders with pagination
router.get('/', authenticateToken, (req: Request, res: Response) => 
  orderController.getAll(req as OrderRequest, res)
);

// Get order statistics
router.get('/stats', authenticateToken, orderController.getStats);

// Get order by ID
router.get('/:id', authenticateToken, orderController.getById);

// Create new order
router.post('/', authenticateToken, orderController.create);

// Update order
router.put('/:id', authenticateToken, orderController.update);

// Delete order
router.delete('/:id', authenticateToken, orderController.delete);

// Get orders by customer ID
router.get('/customer/:customerId', authenticateToken, orderController.getByCustomerId);

export default router; 