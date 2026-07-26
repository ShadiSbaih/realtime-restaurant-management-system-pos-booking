import { Table } from './table.model';
import { User } from './user.model';

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MPESA = 'MPESA'
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  menuItemImage?: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  table?: Table;
  items: OrderItem[];
  customerName?: string;
  customerPhone?: string;
  user?: User;
}

export interface CreateOrderRequest {
  items: { menuItemId: string; quantity: number; notes?: string }[];
  orderType: OrderType;
  tableId?: string;
  paymentMethod: PaymentMethod;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
}
