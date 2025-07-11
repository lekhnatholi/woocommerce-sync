import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface IProduct extends Document {
  wooCommerceId: number;
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
  images: IProductImage[];
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
  date_created: Date;
  date_modified: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const productImageSchema = new Schema<IProductImage>({
  id: { type: Number, required: true },
  src: { type: String, required: true },
  name: { type: String, required: true },
  alt: { type: String, required: true }
});

const dimensionsSchema = new Schema({
  length: { type: String, default: '' },
  width: { type: String, default: '' },
  height: { type: String, default: '' }
});

const categorySchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true }
});

const tagSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true }
});

const productSchema = new Schema<IProduct>({
  wooCommerceId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true },
  featured: { type: Boolean, default: false },
  catalog_visibility: { type: String, required: true },
  description: { type: String, default: '' },
  short_description: { type: String, default: '' },
  sku: { type: String, default: '' },
  price: { type: String, default: '' },
  regular_price: { type: String, default: '' },
  sale_price: { type: String, default: '' },
  on_sale: { type: Boolean, default: false },
  purchasable: { type: Boolean, default: true },
  total_sales: { type: Number, default: 0 },
  virtual: { type: Boolean, default: false },
  downloadable: { type: Boolean, default: false },
  tax_status: { type: String, default: 'taxable' },
  tax_class: { type: String, default: '' },
  manage_stock: { type: Boolean, default: false },
  stock_quantity: { type: Number, default: null },
  stock_status: { type: String, default: 'instock' },
  backorders: { type: String, default: 'no' },
  backorders_allowed: { type: Boolean, default: false },
  backordered: { type: Boolean, default: false },
  sold_individually: { type: Boolean, default: false },
  weight: { type: String, default: '' },
  dimensions: { type: dimensionsSchema, default: {} },
  shipping_required: { type: Boolean, default: true },
  shipping_taxable: { type: Boolean, default: true },
  shipping_class: { type: String, default: '' },
  shipping_class_id: { type: Number, default: 0 },
  reviews_allowed: { type: Boolean, default: true },
  average_rating: { type: String, default: '0' },
  rating_count: { type: Number, default: 0 },
  images: [{ type: productImageSchema }],
  categories: [{ type: categorySchema }],
  tags: [{ type: tagSchema }],
  date_created: { type: Date, required: true },
  date_modified: { type: Date, required: true }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ wooCommerceId: 1 });
productSchema.index({ name: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ date_created: -1 });
productSchema.index({ date_modified: -1 });

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text', short_description: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema); 