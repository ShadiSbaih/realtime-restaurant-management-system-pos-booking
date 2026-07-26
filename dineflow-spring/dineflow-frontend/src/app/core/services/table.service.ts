import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Table, TableStatus } from '../models/table.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = `${environment.apiUrl}/tables`;

  constructor(private http: HttpClient) {}

  getTables(): Observable<Table[]> {
    return this.http.get<Table[]>(this.apiUrl);
  }

  getTableById(id: string): Observable<Table> {
    return this.http.get<Table>(`${this.apiUrl}/${id}`);
  }

  createTable(data: Partial<Table>): Observable<Table> {
    return this.http.post<Table>(this.apiUrl, data);
  }

  updateTable(id: string, data: Partial<Table>): Observable<Table> {
    return this.http.patch<Table>(`${this.apiUrl}/${id}`, data);
  }

  updateTableStatus(id: string, status: TableStatus): Observable<Table> {
    return this.http.patch<Table>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteTable(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
