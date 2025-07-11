import mongoose, { Document, Schema } from 'mongoose';
import cron, { ScheduledTask } from 'node-cron';

// TypeScript interfaces
export interface IOrderItem {
  product_id: number;
  name: string;
  quantity: number;
  total: string;
  price: string;
  sku?: string;
}

export interface IBillingAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone?: string;
}

export interface IShippingAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface IOrder extends Document {
  wooCommerceId: number;
  number: string;
  order_key: string;
  status: string;
  date_created: Date;
  total: string;
  customer_id: number;
  customer_note: string;
  billing: IBillingAddress;
  shipping: IShippingAddress;
  line_items: IOrderItem[];
  last_modified: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const orderItemSchema = new Schema<IOrderItem>({
  product_id: { type: Number, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  total: { type: String, required: true },
  price: { type: String, required: true },
  sku: { type: String }
});

const billingAddressSchema = new Schema<IBillingAddress>({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  address_1: { type: String, required: true },
  address_2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postcode: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String }
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  address_1: { type: String, required: true },
  address_2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postcode: { type: String, required: true },
  country: { type: String, required: true }
});

const orderSchema = new Schema<IOrder>({
  wooCommerceId: { type: Number, required: true, unique: true },
  number: { type: String, required: true },
  order_key: { type: String, required: true },
  status: { type: String, required: true },
  date_created: { type: Date, required: true },
  total: { type: String, required: true },
  customer_id: { type: Number, required: true },
  customer_note: { type: String, default: '' },
  billing: { type: billingAddressSchema, required: true },
  shipping: { type: shippingAddressSchema, required: true },
  line_items: [{ type: orderItemSchema, required: true }],
  last_modified: { type: Date, required: true }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ wooCommerceId: 1 });
orderSchema.index({ date_created: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ customer_id: 1 });
orderSchema.index({ last_modified: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema); 