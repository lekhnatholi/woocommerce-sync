import { Order, IOrder } from '../models/Order';
import { Product, IProduct } from '../models/Product';
import WooCommerceService, { WooCommerceOrder, WooCommerceProduct } from './WooCommerceService';
import { createLogger, format, transports } from 'winston';

// Configure Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'sync-service' },
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

export class SyncService {
  private wooCommerceService: WooCommerceService;

  constructor() {
    this.wooCommerceService = new WooCommerceService();
  }

  /**
   * Sync orders from the last 30 days
   */
  async syncOrders(): Promise<{ synced: number; errors: number }> {
    logger.info('Starting order sync...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 240);
    const afterDate = thirtyDaysAgo.toISOString();


    let synced = 0;
    let errors = 0;
    let page = 1;
    const perPage = 100;

    try {
      while (true) {
        logger.info(`Fetching orders page ${page}...`);
        
        const orders = await this.wooCommerceService.fetchOrders(page, perPage, afterDate);
        
        if (orders.length === 0) {
          logger.info('No more orders to sync');
          break;
        }

        for (const wooOrder of orders) {
          try {
            await this.syncOrder(wooOrder);
            synced++;
            logger.debug(`Synced order ${wooOrder.id}`);
          } catch (error) {
            errors++;
            logger.error(`Error syncing order ${wooOrder.id}:`, error);
          }
        }

        // If we got less than perPage items, we've reached the end
        if (orders.length < perPage) {
          break;
        }

        page++;
      }

      logger.info(`Order sync completed. Synced: ${synced}, Errors: ${errors}`);
      return { synced, errors };
    } catch (error) {
      logger.error('Fatal error during order sync:', error);
      throw error;
    }
  }

  /**
   * Sync a single order
   */
  private async syncOrder(wooOrder: WooCommerceOrder): Promise<void> {
    const orderData = {
      wooCommerceId: wooOrder.id,
      number: wooOrder.number,
      order_key: wooOrder.order_key,
      status: wooOrder.status,
      date_created: new Date(wooOrder.date_created),
      total: wooOrder.total,
      customer_id: wooOrder.customer_id,
      customer_note: wooOrder.customer_note || '',
      billing: wooOrder.billing,
      shipping: wooOrder.shipping,
      line_items: wooOrder.line_items,
      last_modified: new Date(wooOrder.date_modified)
    };

    // Use upsert to update existing or create new
    await Order.findOneAndUpdate(
      { wooCommerceId: wooOrder.id },
      orderData,
      { upsert: true, new: true }
    );

    // Sync products from line items if they don't exist
    await this.syncProductsFromOrder(wooOrder);
  }

  /**
   * Sync products from order line items
   */
  private async syncProductsFromOrder(wooOrder: WooCommerceOrder): Promise<void> {
    const productIds = [...new Set(wooOrder.line_items.map(item => item.product_id))];
    
    for (const productId of productIds) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({ wooCommerceId: productId });
        if (existingProduct) {
          continue; // Product already exists, skip
        }

        // Fetch and sync the product
        const wooProduct = await this.wooCommerceService.fetchProduct(productId);
        await this.syncProduct(wooProduct);
        logger.debug(`Synced product ${productId} from order ${wooOrder.id}`);
      } catch (error) {
        logger.error(`Error syncing product ${productId} from order ${wooOrder.id}:`, error);
      }
    }
  }

  /**
   * Sync a single product
   */
  private async syncProduct(wooProduct: WooCommerceProduct): Promise<void> {
    const productData = {
      wooCommerceId: wooProduct.id,
      name: wooProduct.name,
      slug: wooProduct.slug,
      type: wooProduct.type,
      status: wooProduct.status,
      featured: wooProduct.featured,
      catalog_visibility: wooProduct.catalog_visibility,
      description: wooProduct.description,
      short_description: wooProduct.short_description,
      sku: wooProduct.sku,
      price: wooProduct.price,
      regular_price: wooProduct.regular_price,
      sale_price: wooProduct.sale_price,
      on_sale: wooProduct.on_sale,
      purchasable: wooProduct.purchasable,
      total_sales: wooProduct.total_sales,
      virtual: wooProduct.virtual,
      downloadable: wooProduct.downloadable,
      tax_status: wooProduct.tax_status,
      tax_class: wooProduct.tax_class,
      manage_stock: wooProduct.manage_stock,
      stock_quantity: wooProduct.stock_quantity,
      stock_status: wooProduct.stock_status,
      backorders: wooProduct.backorders,
      backorders_allowed: wooProduct.backorders_allowed,
      backordered: wooProduct.backordered,
      sold_individually: wooProduct.sold_individually,
      weight: wooProduct.weight,
      dimensions: wooProduct.dimensions,
      shipping_required: wooProduct.shipping_required,
      shipping_taxable: wooProduct.shipping_taxable,
      shipping_class: wooProduct.shipping_class,
      shipping_class_id: wooProduct.shipping_class_id,
      reviews_allowed: wooProduct.reviews_allowed,
      average_rating: wooProduct.average_rating,
      rating_count: wooProduct.rating_count,
      images: wooProduct.images,
      categories: wooProduct.categories,
      tags: wooProduct.tags,
      date_created: new Date(wooProduct.date_created),
      date_modified: new Date(wooProduct.date_modified)
    };

    await Product.findOneAndUpdate(
      { wooCommerceId: wooProduct.id },
      productData,
      { upsert: true, new: true }
    );
  }

  /**
   * Clean up old orders (not modified in last 3 months)
   */
  async cleanupOldOrders(): Promise<{ deletedOrders: number; deletedProducts: number }> {
    logger.info('Starting cleanup of old orders...');
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    try {
      // Find orders to delete
      const ordersToDelete = await Order.find({
        last_modified: { $lt: threeMonthsAgo }
      });

      logger.info(`Found ${ordersToDelete.length} orders to delete`);

      let deletedOrders = 0;
      const productIdsToCheck = new Set<number>();

      // Delete orders and collect product IDs
      for (const order of ordersToDelete) {
        try {
          // Collect product IDs from line items
          order.line_items.forEach(item => {
            productIdsToCheck.add(item.product_id);
          });

          await Order.findByIdAndDelete(order._id);
          deletedOrders++;
          logger.debug(`Deleted order ${order.wooCommerceId}`);
        } catch (error) {
          logger.error(`Error deleting order ${order.wooCommerceId}:`, error);
        }
      }

      // Check which products are no longer used
      const deletedProducts = await this.cleanupUnusedProducts(Array.from(productIdsToCheck));

      logger.info(`Cleanup completed. Deleted orders: ${deletedOrders}, Deleted products: ${deletedProducts}`);
      return { deletedOrders, deletedProducts };
    } catch (error) {
      logger.error('Error during cleanup:', error);
      throw error;
    }
  }

  /**
   * Clean up products that are no longer used in any orders
   */
  private async cleanupUnusedProducts(productIds: number[]): Promise<number> {
    let deletedProducts = 0;

    for (const productId of productIds) {
      try {
        // Check if this product is used in any remaining orders
        const orderWithProduct = await Order.findOne({
          'line_items.product_id': productId
        });

        if (!orderWithProduct) {
          // Product is not used in any orders, delete it
          await Product.findOneAndDelete({ wooCommerceId: productId });
          deletedProducts++;
          logger.debug(`Deleted unused product ${productId}`);
        }
      } catch (error) {
        logger.error(`Error checking/deleting product ${productId}:`, error);
      }
    }

    return deletedProducts;
  }

  /**
   * Test WooCommerce connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const isConnected = await this.wooCommerceService.testConnection();
      logger.info(`WooCommerce connection test: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
      return isConnected;
    } catch (error) {
      logger.error('WooCommerce connection test failed:', error);
      return false;
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    totalOrders: number;
    totalProducts: number;
    lastSyncDate?: Date;
  }> {
    try {
      const [totalOrders, totalProducts, lastOrder] = await Promise.all([
        Order.countDocuments(),
        Product.countDocuments(),
        Order.findOne().sort({ updatedAt: -1 })
      ]);

      return {
        totalOrders,
        totalProducts,
        lastSyncDate: lastOrder?.updatedAt
      };
    } catch (error) {
      logger.error('Error getting sync stats:', error);
      throw error;
    }
  }
}

export default SyncService; 