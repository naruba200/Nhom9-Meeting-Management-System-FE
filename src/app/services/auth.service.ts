import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  OtpRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  UserProfile,
  UpdateProfileRequest,
  GoogleLinkStatusResponse,
  GoogleLinkUrlResponse,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private readonly GOOGLE_STATUS_KEY = 'googleLinkStatus';
  private readonly ROLE_KEY = 'userRole';
  private readonly USER_INFO_KEY = 'userInfo';
  private readonly googleLinkStatus$ = new BehaviorSubject<GoogleLinkStatusResponse | null>(
    this.readGoogleStatusFromStorage()
  );
  private readonly userInfo$ = new BehaviorSubject<{ email: string; fullName: string } | null>(
    this.readUserInfoFromStorage() ?? this.readUserInfoFromToken()
  );
  readonly googleLinkStatus = this.googleLinkStatus$.asObservable();
  readonly userInfo = this.userInfo$.asObservable();

  constructor(private http: HttpClient) {}

  private readGoogleStatusFromStorage(): GoogleLinkStatusResponse | null {
    try {
      const stored = localStorage.getItem('googleLinkStatus');
      return stored ? (JSON.parse(stored) as GoogleLinkStatusResponse) : null;
    } catch {
      return null;
    }
  }

  private readUserInfoFromStorage(): { email: string; fullName: string } | null {
    try {
      const stored = localStorage.getItem(this.USER_INFO_KEY);
      return stored ? (JSON.parse(stored) as { email: string; fullName: string }) : null;
    } catch {
      return null;
    }
  }

  private readUserInfoFromToken(): { email: string; fullName: string } | null {
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

  private setUserInfo(userInfo: { email: string; fullName: string } | null): void {
    this.userInfo$.next(userInfo);
    try {
      if (userInfo) {
        localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
      } else {
        localStorage.removeItem(this.USER_INFO_KEY);
      }
    } catch {
      // ignore localStorage errors
    }
  }

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

  getGoogleLinkUrl(): Observable<GoogleLinkUrlResponse> {
    return this.http.get<GoogleLinkUrlResponse>(`${this.apiUrl}/google/link-url`);
  }

  getGoogleLinkStatus(): Observable<GoogleLinkStatusResponse> {
    return this.http.get<GoogleLinkStatusResponse>(`${this.apiUrl}/google/status`).pipe(
      tap(status => {
        this.googleLinkStatus$.next(status);
        try { localStorage.setItem(this.GOOGLE_STATUS_KEY, JSON.stringify(status)); } catch { /* ignore */ }
      })
    );
  }

  getCachedGoogleLinkStatus(): GoogleLinkStatusResponse | null {
    return this.googleLinkStatus$.value;
  }

  invalidateGoogleLinkStatus(): void {
    this.googleLinkStatus$.next(null);
    try { localStorage.removeItem(this.GOOGLE_STATUS_KEY); } catch { /* ignore */ }
  }

  // Lưu token vào localStorage
  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.setUserInfo(this.readUserInfoFromToken());
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
    this.setUserInfo(null);
  }

  // Lưu role vào localStorage
  saveRole(role: string): void {
    localStorage.setItem(this.ROLE_KEY, role);
  }

  // Lấy role từ localStorage
  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  // Xóa role
  removeRole(): void {
    localStorage.removeItem(this.ROLE_KEY);
  }

  // Kiểm tra có phải admin không
  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  // Kiểm tra token có hết hạn không
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryDate = new Date(payload.exp * 1000);
      const now = new Date();
      return now >= expiryDate;
    } catch {
      return true;
    }
  }

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Kiểm tra token có hết hạn không
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }
    
    return true;
  }

  // Lấy thông tin user từ token
  getUserInfo(): { email: string; fullName: string } | null {
    return this.userInfo$.value;
  }

  updateUserInfoFromProfile(profile: UserProfile): void {
    this.setUserInfo({
      email: profile.email,
      fullName: profile.fullName || ''
    });
  }

  // Đăng xuất
  logout(): void {
    this.removeToken();
    this.removeRole();
    this.invalidateGoogleLinkStatus();
  }
}
