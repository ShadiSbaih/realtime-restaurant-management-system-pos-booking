export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  KITCHEN = 'KITCHEN',
  CUSTOMER = 'CUSTOMER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
  banned: boolean;
  banReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  // Spring Boot field names
  totalItems?: number;
  itemsPerPage?: number;
  currentPage?: number;
  // Legacy/alternate names
  total?: number;
  page?: number;
  limit?: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  hasPrevPage?: boolean;
}
