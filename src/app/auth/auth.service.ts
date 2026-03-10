import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'USER';
  };
}

// Fake accounts for testing
const FAKE_ACCOUNTS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    fullName: 'Admin User',
    role: 'ADMIN' as const
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    fullName: 'John Doe',
    role: 'USER' as const
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; // Update with your backend URL
  private tokenKey = 'authToken';
  private userKey = 'user';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    // Check fake accounts first
    const fakeAccount = FAKE_ACCOUNTS.find(
      acc => acc.email === email && acc.password === password
    );

    if (fakeAccount) {
      const response: AuthResponse = {
        token: 'fake-token-' + Date.now(),
        user: {
          id: fakeAccount.id,
          email: fakeAccount.email,
          fullName: fakeAccount.fullName,
          role: fakeAccount.role
        }
      };
      this.storeToken(response.token);
      this.storeUser(response.user);
      return of(response);
    }

    // If not a fake account, try real backend
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap((response) => {
        this.storeToken(response.token);
        this.storeUser(response.user);
      }),
      catchError((error) => {
        return throwError(() => ({
          message: error.error?.message || 'Login failed'
        }));
      })
    );
  }

  signup(fullName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      fullName,
      email,
      password
    }).pipe(
      tap((response) => {
        this.storeToken(response.token);
        this.storeUser(response.user);
      }),
      catchError((error) => {
        return throwError(() => ({
          message: error.error?.message || 'Signup failed'
        }));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private storeUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}

