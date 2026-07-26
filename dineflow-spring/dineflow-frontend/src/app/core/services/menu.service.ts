import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuItem, Category } from '../models/menu.model';
import { PaginatedResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/menu`;
  private categoryUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  // ─── Menu Items ────────────────────────────────────────────────────────

  getMenuItems(page: number = 1, limit: number = 20, category?: string, search?: string): Observable<PaginatedResponse<MenuItem>> {
    let params: any = { page, limit };
    if (category) params.category = category;
    if (search) params.search = search;
    return this.http.get<PaginatedResponse<MenuItem>>(this.apiUrl, { params });
  }

  getMenuItemById(id: string): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.apiUrl}/${id}`);
  }

  createMenuItem(data: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, data);
  }

  updateMenuItem(id: string, data: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.patch<MenuItem>(`${this.apiUrl}/${id}`, data);
  }

  deleteMenuItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addFeedback(itemId: string, data: { rating: number; comment: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${itemId}/feedback`, data);
  }

  // ─── Categories ────────────────────────────────────────────────────────

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryUrl);
  }

  createCategory(name: string): Observable<Category> {
    return this.http.post<Category>(this.categoryUrl, { name });
  }

  updateCategory(id: string, name: string): Observable<Category> {
    return this.http.patch<Category>(`${this.categoryUrl}/${id}`, { name });
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.categoryUrl}/${id}`);
  }
}
