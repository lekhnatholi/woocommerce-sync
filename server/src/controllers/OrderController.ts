import { Request, Response } from 'express';
import { Order, IOrder } from '../models/Order';

export class OrderController {
  /**
   * Get all orders with pagination, search, filtering, and sorting
   */
  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        sortBy = 'date_created',
        sortOrder = 'desc',
        productId
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
          { number: searchRegex },
          { 'billing.first_name': searchRegex },
          { 'billing.last_name': searchRegex },
          { 'billing.email': searchRegex },
          { 'shipping.first_name': searchRegex },
          { 'shipping.last_name': searchRegex },
          { 'line_items.name': searchRegex }
        ];
      }

      // Status filter
      if (status) {
        query.status = status;
      }

      // Product filter
      if (productId) {
        query['line_items.product_id'] = parseInt(productId as string, 10);
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Order.countDocuments(query)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      res.json({
        orders,
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
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const order = await Order.findById(id).lean();
      
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }


  /**
   * Get orders by customer ID
   */
  async getOrdersByCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const [orders, total] = await Promise.all([
        Order.find({ customer_id: parseInt(customerId, 10) })
          .sort({ date_created: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Order.countDocuments({ customer_id: parseInt(customerId, 10) })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.json({
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum
        }
      });
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      res.status(500).json({ error: 'Failed to fetch customer orders' });
    }
  }

  /**
   * Search orders with advanced filters
   */
  async searchOrders(req: Request, res: Response): Promise<void> {
    try {
      const {
        query,
        startDate,
        endDate,
        minTotal,
        maxTotal,
        status,
        page = 1,
        limit = 20
      } = req.body;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build advanced query
      const searchQuery: any = {};

      // Text search
      if (query) {
        const searchRegex = new RegExp(query, 'i');
        searchQuery.$or = [
          { number: searchRegex },
          { 'billing.first_name': searchRegex },
          { 'billing.last_name': searchRegex },
          { 'billing.email': searchRegex },
          { 'shipping.first_name': searchRegex },
          { 'shipping.last_name': searchRegex },
          { 'line_items.name': searchRegex },
          { customer_note: searchRegex }
        ];
      }

      // Date range
      if (startDate || endDate) {
        searchQuery.date_created = {};
        if (startDate) {
          searchQuery.date_created.$gte = new Date(startDate);
        }
        if (endDate) {
          searchQuery.date_created.$lte = new Date(endDate);
        }
      }

      // Total range
      if (minTotal || maxTotal) {
        searchQuery.total = {};
        if (minTotal) {
          searchQuery.total.$gte = minTotal.toString();
        }
        if (maxTotal) {
          searchQuery.total.$lte = maxTotal.toString();
        }
      }

      // Status filter
      if (status) {
        searchQuery.status = status;
      }

      const [orders, total] = await Promise.all([
        Order.find(searchQuery)
          .sort({ date_created: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Order.countDocuments(searchQuery)
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.json({
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum
        }
      });
    } catch (error) {
      console.error('Error searching orders:', error);
      res.status(500).json({ error: 'Failed to search orders' });
    }
  }
}

export default OrderController; 