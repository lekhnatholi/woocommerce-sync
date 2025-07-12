import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5050/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Product interface based on the provided data structure
export interface Product {
  _id: string;
  wooCommerceId: number;
  name: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  description: string;
  short_description: string;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
    _id: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    _id: string;
  }>;
  total_sales: number;
  stock_status: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Order interfaces based on the server structure
export interface OrderLineItem {
  id: number;
  name: string;
  quantity: number;
  price: string;
  product_id: number;
}

export interface OrderAddress {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address_1: string;
  city: string;
  state: string;
  postcode: string;
}

export interface Order {
  _id: string;
  wooCommerceId: number;
  number: string;
  order_key: string;
  status: string;
  date_created: string;
  total: string;
  customer_id: number;
  customer_note: string;
  billing: OrderAddress;
  shipping: OrderAddress;
  line_items: OrderLineItem[];
}

// Pagination interface
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// API response interfaces
export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

// Product API service
export const productService = {
  // Get all products with optional pagination and search
  getProducts: async (page: number = 1, limit: number = 20, search?: string): Promise<ProductsResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await api.get<ProductsResponse>(`/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get a single product by ID
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Search products using the main endpoint with search parameter
  searchProducts: async (query: string, page: number = 1, limit: number = 20): Promise<ProductsResponse> => {
    try {
      // Use the main products endpoint with search parameter
      return await productService.getProducts(page, limit, query);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },
};

// Order API service
export const orderService = {
  // Get all orders with optional pagination, search, and filtering
  getOrders: async (
    page: number = 1, 
    limit: number = 20, 
    search?: string, 
    status?: string, 
    productId?: string
  ): Promise<OrdersResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      if (status && status !== 'all') {
        params.append('status', status);
      }
      
      if (productId) {
        params.append('productId', productId);
      }
      
      const response = await api.get<OrdersResponse>(`/orders?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get a single order by ID
  getOrderById: async (id: string): Promise<Order> => {
    try {
      const response = await api.get<Order>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Get orders by customer ID
  getOrdersByCustomer: async (customerId: string, page: number = 1, limit: number = 20): Promise<OrdersResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      const response = await api.get<OrdersResponse>(`/orders/customer/${customerId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  },

  // Search orders using the main endpoint with search parameter
  searchOrders: async (
    query: string, 
    page: number = 1, 
    limit: number = 20, 
    status?: string
  ): Promise<OrdersResponse> => {
    try {
      // Use the main orders endpoint with search parameter
      return await orderService.getOrders(page, limit, query, status);
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    }
  },
};

export default api; 