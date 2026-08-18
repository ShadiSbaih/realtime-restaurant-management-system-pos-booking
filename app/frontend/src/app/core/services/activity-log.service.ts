import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page?: number;
  currentPage?: number;
  limit?: number;
  itemsPerPage?: number;
  totalElements?: number;
  totalItems?: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private apiUrl = `${environment.apiUrl}/activities-log`;

  constructor(private http: HttpClient) {}

  getLogs(page: number = 1, limit: number = 10): Observable<PaginatedResponse<ActivityLog>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<ActivityLog>>(this.apiUrl, { params });
  }
}
