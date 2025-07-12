import { Request, Response } from 'express';
import { Product, IProduct } from '../models/Product';
import { Order } from '../models/Order';

export class ProductController {
  /**
   * Get all products with pagination, search, filtering, and sorting
   */
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        featured,
        sortBy = 'name',
        sortOrder = 'asc',
        includeOrderCount = 'false'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const query: any = {};

      // Search functionality
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        query.$or = [
          { name: searchRegex },
          { sku: searchRegex },
          { description: searchRegex },
          { short_description: searchRegex }
        ];
      }

      // Status filter
      if (status) {
        query.status = status;
      }

      // Featured filter
      if (featured !== undefined) {
        query.featured = featured === 'true';
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Product.countDocuments(query)
      ]);

      // Add order count if requested
      let productsWithOrderCount = products;
      if (includeOrderCount === 'true') {
        productsWithOrderCount = await this.addOrderCounts(products);
      }

      // Calculate pagination info
      const totalPages = Math.ceil(total / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      res.json({
        products: productsWithOrderCount,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { includeOrderCount = 'false' } = req.query;
      
      const product = await Product.findById(id).lean();
      
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      // Add order count if requested
      let productWithOrderCount = product;
      if (includeOrderCount === 'true') {
        const orderCount = await this.getProductOrderCount(product.wooCommerceId);
        productWithOrderCount = { ...product, orderCount } as any;
      }

      res.json(productWithOrderCount);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  }



  /**
   * Search products with advanced filters
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        query,
        category,
        minPrice,
        maxPrice,
        status,
        featured,
        page = 1,
        limit = 20,
        includeOrderCount = false
      } = req.body;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build advanced query
      const searchQuery: any = {};
      console.log({searchQuery})

      // Text search
      if (query) {
        const searchRegex = new RegExp(query, 'i');
        searchQuery.$or = [
          { name: searchRegex },
          { sku: searchRegex },
          { description: searchRegex },
          { short_description: searchRegex }
        ];
      }

      // Category filter
      if (category) {
        searchQuery['categories.name'] = new RegExp(category, 'i');
      }

      // Price range
      if (minPrice || maxPrice) {
        searchQuery.price = {};
        if (minPrice) {
          searchQuery.price.$gte = minPrice.toString();
        }
        if (maxPrice) {
          searchQuery.price.$lte = maxPrice.toString();
        }
      }

      // Status filter
      if (status) {
        searchQuery.status = status;
      }

      // Featured filter
      if (featured !== undefined) {
        searchQuery.featured = featured;
      }

      const [products, total] = await Promise.all([
        Product.find(searchQuery)
          .sort({ name: 1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Product.countDocuments(searchQuery)
      ]);

      // Add order count if requested
      let productsWithOrderCount = products;
      if (includeOrderCount) {
        productsWithOrderCount = await this.addOrderCounts(products);
      }

      const totalPages = Math.ceil(total / limitNum);

      res.json({
        products: productsWithOrderCount,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum
        }
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Failed to search products' });
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const categoryRegex = new RegExp(category, 'i');

      const [products, total] = await Promise.all([
        Product.find({ 'categories.name': categoryRegex })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Product.countDocuments({ 'categories.name': categoryRegex })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.json({
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum
        }
      });
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ error: 'Failed to fetch products by category' });
    }
  }

  /**
   * Get all categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Product.aggregate([
        {
          $unwind: '$categories'
        },
        {
          $group: {
            _id: '$categories.id',
            name: { $first: '$categories.name' },
            slug: { $first: '$categories.slug' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  /**
   * Add order counts to products
   */
  private async addOrderCounts(products: any[]): Promise<any[]> {
    const productsWithCounts = await Promise.all(
      products.map(async (product) => {
        const orderCount = await this.getProductOrderCount(product.wooCommerceId);
        return { ...product, orderCount };
      })
    );
    return productsWithCounts;
  }

  /**
   * Get order count for a specific product
   */
  private async getProductOrderCount(wooCommerceId: number): Promise<number> {
    return await Order.countDocuments({
      'line_items.product_id': wooCommerceId
    });
  }
}

export default ProductController; 