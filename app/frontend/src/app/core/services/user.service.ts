import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, PaginatedResponse, Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(page: number = 1, limit: number = 100, search?: string, role?: string): Observable<PaginatedResponse<User>> {
    let params: any = { page, limit };
    if (search) params.search = search;
    if (role && role !== 'ALL') params.role = role;
    return this.http.get<PaginatedResponse<User>>(this.apiUrl, { params });
  }

  updateRole(userId: string, role: Role): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/role`, { role });
  }

  banUser(userId: string, reason: string = 'Admin action'): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/ban`, { reason });
  }

  unbanUser(userId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/unban`, {});
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
}
