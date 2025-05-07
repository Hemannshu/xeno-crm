import { Router, Request, Response } from 'express';
import { customerController } from '../controllers/customer.controller';

// Define the request type with query parameters
interface CustomerRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    query?: string;
  };
}

const router = Router();

// Get all customers with pagination
router.get('/', (req: Request, res: Response) => 
  customerController.getAll(req as CustomerRequest, res)
);

// Search customers
router.get('/search', (req: Request, res: Response) => 
  customerController.search(req as CustomerRequest, res)
);

// Get customer by ID
router.get('/:id', customerController.getById);

// Create new customer
router.post('/', customerController.create);

// Update customer
router.put('/:id', customerController.update);

// Delete customer
router.delete('/:id', customerController.delete);

export default router; 