export type UserRole = "user" | "admin";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: IAddress;
  wishlist: string[];
  createdAt: string;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  collection?: string;
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  bestSeller: boolean;
  limitedDrop: boolean;
  salesRank?: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ICartItem {
 productId: string;
 name: string;
 slug: string;
 image: string;
 price: number;
 size: string;
 color?: string;
 quantity: number;
 }

export interface IOrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "in-orbit"
  | "delivered"
  | "cancelled";

export interface IOrder {
  _id: string;
  userId: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: IAddress;
  paymentMethod: string;
  couponCode?: string;
  trackingNumber?: string | null;
  giftWrap?: boolean;
  giftMessage?: string | null;
  createdAt: string;
}

export interface IReview {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
}

export interface IBanner {
  _id: string;
  image: string;
  active: boolean;
  createdAt: string;
}

export interface ICategory {
   _id: string;
   name: string;
   slug: string;
   description?: string;
 }

 export { type ReplacementStatus, type ReplacementType, type IReplacementRequest } from "./replacement";

 export type { ReplacementStatus as IReplacementStatus } from "./replacement";
