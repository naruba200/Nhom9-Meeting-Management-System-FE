import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData: RegisterRequest = {
    email: '',
    password: '',
    fullName: '',
    phone: ''
  };
  
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showOtpVerification = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validate passwords match
    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Attempting to register with data:', this.registerData);
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Register response received:', response);
        console.log('Response type:', typeof response);
        console.log('Response length:', response?.length);
        
        // Lưu email để dùng cho trang OTP
        localStorage.setItem('registerEmail', this.registerData.email);
        
        this.successMessage = response || 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.';
        this.showOtpVerification = true;
        this.isLoading = false; // Đảm bảo set về false
        
        console.log('isLoading set to false');
        console.log('About to navigate to /verify-otp');
        
        // Chuyển sang trang OTP ngay lập tức
        this.router.navigate(['/verify-otp']);
      },
      error: (error) => {
        console.error('Register error:', error);
        console.error('Error details:', error.status, error.statusText);
        this.errorMessage = error.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        this.isLoading = false;
      },
      complete: () => {
        console.log('Register request completed');
        this.isLoading = false;
      }
    });
  }
}
