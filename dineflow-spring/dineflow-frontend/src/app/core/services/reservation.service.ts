import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reservation, CreateReservationRequest, BookingStatus } from '../models/reservation.model';
import { PaginatedResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  getReservations(page: number = 1, limit: number = 20, userId?: string): Observable<PaginatedResponse<Reservation>> {
    let params: any = { page, limit };
    if (userId) params.userId = userId;
    return this.http.get<PaginatedResponse<Reservation>>(this.apiUrl, { params });
  }

  createReservation(request: CreateReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, request);
  }

  updateStatus(id: string, status: BookingStatus): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}/status`, { status });
  }
}
