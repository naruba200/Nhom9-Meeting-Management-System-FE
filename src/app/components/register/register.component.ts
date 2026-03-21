import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
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

  private getErrorMessage(error: any, fallback: string): string {
    if (error?.error?.message) {
      return error.error.message;
    }

    if (typeof error?.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (Array.isArray(error?.error?.errors) && error.error.errors.length > 0) {
      return error.error.errors.join(', ');
    }

    if (error?.message) {
      return error.message;
    }

    return fallback;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(form: NgForm): void {
    if (this.isLoading) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.isLoading = false;
      this.errorMessage = 'Vui lòng nhập đầy đủ và đúng định dạng thông tin đăng ký.';
      return;
    }

    // Validate passwords match
    if (this.registerData.password !== this.confirmPassword) {
      this.isLoading = false;
      this.errorMessage = 'Mật khẩu xác nhận không khớp!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Attempting to register with data:', this.registerData);
    this.authService.register(this.registerData)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          console.log('Register response received:', response);
          console.log('Response type:', typeof response);
          console.log('Response length:', response?.length);
          
          // Lưu email để dùng cho trang OTP
          localStorage.setItem('registerEmail', this.registerData.email);
          
          this.successMessage = response || 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.';
          this.showOtpVerification = true;
          this.cdr.detectChanges();
          
          console.log('About to navigate to /verify-otp');
          
          // Chuyển sang trang OTP ngay lập tức
          this.router.navigate(['/verify-otp']);
        },
        error: (error) => {
          console.error('Register error:', error);
          console.error('Error details:', error.status, error.statusText);
          if (error.status === 0) {
            this.errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
          } else {
            this.errorMessage = this.getErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.');
          }
        }
      });
  }
}
