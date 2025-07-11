import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface WooCommerceOrder {
  id: number;
  number: string;
  order_key: string;
  status: string;
  date_created: string;
  date_modified: string;
  total: string;
  customer_id: number;
  customer_note: string;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    product_id: number;
    name: string;
    quantity: number;
    total: string;
    price: string;
    sku: string;
  }>;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  date_created: string;
  date_modified: string;
}

export class WooCommerceService {
  private client: AxiosInstance;
  private baseURL: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor() {
    this.baseURL = process.env.WOOCOMMERCE_URL || '';
    this.consumerKey = process.env.WOOCOMMERCE_KEY || '';
    this.consumerSecret = process.env.WOOCOMMERCE_SECRET || '';

    if (!this.baseURL || !this.consumerKey || !this.consumerSecret) {
      throw new Error('WooCommerce credentials are not properly configured');
    }

    this.client = axios.create({
      baseURL: `${this.baseURL}/wp-json/wc/v3`,
      auth: {
        username: this.consumerKey,
        password: this.consumerSecret
      },
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Matat-WooCommerce-Sync/1.0'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('WooCommerce API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetch orders from WooCommerce
   */
  async fetchOrders(page: number = 1, perPage: number = 100, after?: string): Promise<WooCommerceOrder[]> {
    try {
      const params: any = {
        page,
        per_page: perPage,
        orderby: 'date',
        order: 'desc'
      };

      if (after) {
        params.after = after;
      }

      const response: AxiosResponse<WooCommerceOrder[]> = await this.client.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error(`Failed to fetch orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch a specific order by ID
   */
  async fetchOrder(orderId: number): Promise<WooCommerceOrder> {
    try {
      const response: AxiosResponse<WooCommerceOrder> = await this.client.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw new Error(`Failed to fetch order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch products from WooCommerce
   */
  async fetchProducts(page: number = 1, perPage: number = 100): Promise<WooCommerceProduct[]> {
    try {
      const params = {
        page,
        per_page: perPage,
        orderby: 'date',
        order: 'desc'
      };

      const response: AxiosResponse<WooCommerceProduct[]> = await this.client.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch a specific product by ID
   */
  async fetchProduct(productId: number): Promise<WooCommerceProduct> {
    try {
      const response: AxiosResponse<WooCommerceProduct> = await this.client.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      throw new Error(`Failed to fetch product ${productId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/products', { params: { per_page: 1 } });
      return response.status === 200;
    } catch (error) {
      console.error('WooCommerce connection test failed:', error);
      return false;
    }
  }

  
}

export default WooCommerceService; 