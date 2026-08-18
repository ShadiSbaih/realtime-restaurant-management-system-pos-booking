import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Use Angular Signals for reactive state
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(true);

  constructor(private http: HttpClient, private router: Router) {}

  get accessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  set accessToken(token: string | null) {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  initAuth(): Observable<boolean> {
    if (!this.accessToken) {
      this.currentUser.set(null);
      this.isLoading.set(false);
      return of(true);
    }

    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.clearSessionLocal();
        this.isLoading.set(false);
        return of(true);
      }),
      map(() => true)
    );
  }

  private clearSessionLocal(): void {
    this.accessToken = null;
    this.currentUser.set(null);
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.accessToken = response.accessToken;
        this.currentUser.set(response.user);
      })
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        this.accessToken = response.accessToken;
        this.currentUser.set(response.user);
      })
    );
  }

  googleLogin(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, { token }).pipe(
      tap(response => {
        this.accessToken = response.accessToken;
        this.currentUser.set(response.user);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap(response => {
        this.accessToken = response.accessToken;
        this.currentUser.set(response.user);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  private clearSession(): void {
    this.accessToken = null;
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(roles: (Role | string)[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }
}
