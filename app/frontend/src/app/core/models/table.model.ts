import { Reservation } from './reservation.model';

export enum TableShape {
  square = 'square',
  rectangle = 'rectangle',
  circle = 'circle'
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED'
}

export interface Table {
  id: string;
  name: string;
  seats: number;
  section: string;
  shape: TableShape;
  status: TableStatus;
  reservations?: Reservation[];
}
