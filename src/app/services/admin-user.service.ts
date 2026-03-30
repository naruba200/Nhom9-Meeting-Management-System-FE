import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminUser, CreateUserRequest, UpdateUserRequest } from '../models/admin-user.models';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private apiUrl = `${environment.apiUrl}/api/admin`;
  private usersSubject = new BehaviorSubject<AdminUser[]>([]);
  public users$: Observable<AdminUser[]> = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadUsers(): void {
    console.log('[AdminUserService] Loading all users from API...');
    this.http.get<AdminUser[]>(`${this.apiUrl}/users`).subscribe({
      next: (users) => {
        console.log('[AdminUserService] Users loaded, updating subject:', users);
        this.usersSubject.next(users);
      },
      error: (err) => console.error('[AdminUserService] Error loading users:', err)
    });
  }

  getAllUsers(): Observable<AdminUser[]> {
    if (this.usersSubject.getValue().length === 0) {
      this.loadUsers();
    }
    return this.users$;
  }

  getUserById(id: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/users/${id}`);
  }

  getUserByEmail(email: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/users/email/${email}`);
  }

  createUser(request: CreateUserRequest): Observable<AdminUser> {
    console.log('[AdminUserService] Creating user:', request);
    return this.http.post<AdminUser>(`${this.apiUrl}/users`, request).pipe(
      tap((newUser) => {
        console.log('[AdminUserService] User created:', newUser);
        const currentUsers = this.usersSubject.getValue();
        this.usersSubject.next([...currentUsers, newUser]);
      })
    );
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<AdminUser> {
    console.log(`[AdminUserService] Updating user ${id}:`, request);
    return this.http.put<AdminUser>(`${this.apiUrl}/users/${id}`, request).pipe(
      tap((updatedUser) => {
        console.log('[AdminUserService] User updated:', updatedUser);
        const currentUsers = this.usersSubject.getValue();
        const updatedUsers = currentUsers.map(user =>
          user.id === updatedUser.id ? updatedUser : user
        );
        this.usersSubject.next(updatedUsers);
      })
    );
  }

  deleteUser(id: number): Observable<void> {
    console.log(`[AdminUserService] Deleting user ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(
      tap(() => {
        console.log(`[AdminUserService] User ${id} deleted.`);
        const currentUsers = this.usersSubject.getValue();
        const remainingUsers = currentUsers.filter(user => user.id !== id);
        this.usersSubject.next(remainingUsers);
      })
    );
  }
}
