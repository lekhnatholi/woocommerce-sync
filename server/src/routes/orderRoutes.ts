import { Router } from 'express';
import OrderController from '../controllers/OrderController';

const router = Router();
const orderController = new OrderController();

// GET /api/orders - Get all orders with pagination, search, filtering, and sorting
router.get('/', orderController.getOrders.bind(orderController));


// GET /api/orders/:id - Get a single order by ID
router.get('/:id', orderController.getOrderById.bind(orderController));

// GET /api/orders/customer/:customerId - Get orders by customer ID
router.get('/customer/:customerId', orderController.getOrdersByCustomer.bind(orderController));

// POST /api/orders/search - Advanced search orders
router.post('/search', orderController.searchOrders.bind(orderController));

export default router; 