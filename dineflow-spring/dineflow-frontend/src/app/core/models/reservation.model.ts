import { Table } from './table.model';
import { User } from './user.model';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface Reservation {
  id: string;
  customerName: string;
  userId?: string;
  user?: User;
  guests: number;
  partySize?: number;
  reservationDate: string;
  status: BookingStatus;
  table?: Table;
}

export interface CreateReservationRequest {
  customerName?: string;
  tableId: string;
  date: string;
  guests: number;
}
