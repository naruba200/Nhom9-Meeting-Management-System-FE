export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
}

export interface OtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  enabled: boolean;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}
