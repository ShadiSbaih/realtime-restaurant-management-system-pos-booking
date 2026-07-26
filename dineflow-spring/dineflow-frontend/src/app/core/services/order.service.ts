import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderRequest, UpdateOrderRequest } from '../models/order.model';
import { PaginatedResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getOrders(page: number = 1, limit: number = 20, userId?: string): Observable<PaginatedResponse<Order>> {
    let params: any = { page, limit };
    if (userId) params.userId = userId;
    return this.http.get<PaginatedResponse<Order>>(this.apiUrl, { params });
  }

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }

  updateOrder(id: string, request: UpdateOrderRequest): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}`, request);
  }
}
