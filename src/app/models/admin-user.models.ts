export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  enabled: boolean;
  googleCalendarLinked: boolean;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  phone?: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  role?: string;
  enabled: boolean;
}
