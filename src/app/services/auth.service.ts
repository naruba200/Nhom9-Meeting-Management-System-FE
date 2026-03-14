import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  OtpRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  UserProfile,
  UpdateProfileRequest
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    console.log('Making login request to:', `${this.apiUrl}/login`);
    console.log('Request payload:', request);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<string> {
    console.log('AuthService.register called with:', request);
    console.log('Making request to:', `${this.apiUrl}/register`);
    return this.http.post(`${this.apiUrl}/register`, request, { 
      responseType: 'text',
      headers: { 'Accept': 'text/plain' }
    });
  }

  verifyOtp(request: OtpRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/verify-otp`, request, { 
      responseType: 'text',
      headers: { 'Accept': 'text/plain' }
    });
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/reset-password`, request);
  }

  // Gửi lại OTP cho email đã đăng ký
  sendOtp(email: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/resend-otp`, { email });
  }

  // Lấy thông tin profile từ backend
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  // Cập nhật thông tin profile
  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, request);
  }

  // Lưu token vào localStorage
  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Lấy token từ localStorage
  getToken(): string | null {
    const token = localStorage.getItem('authToken')?.trim();
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }

    return token;
  }

  // Xóa token
  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Lấy thông tin user từ token
  getUserInfo(): { email: string; fullName: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.sub,
        fullName: payload.fullName || ''
      };
    } catch {
      return null;
    }
  }

  // Đăng xuất
  logout(): void {
    this.removeToken();
  }
}
