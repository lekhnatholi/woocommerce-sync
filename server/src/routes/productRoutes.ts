import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

const router = Router();
const productController = new ProductController();

// GET /api/products - Get all products with pagination, search, filtering, and sorting
router.get('/', productController.getProducts.bind(productController));


// GET /api/products/:id - Get a single product by ID
router.get('/:id', productController.getProductById.bind(productController));

// POST /api/products/search - Advanced search products
router.post('/search', productController.searchProducts.bind(productController));

// Optionally, add more routes as needed (e.g., categories, by category, etc.)

export default router; 