import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';

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
  ) {
    console.log('Login component initialized');
  }

  onSubmit(form: NgForm): void {
    console.log('onSubmit called!');

    if (this.isLoading) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.isLoading = false;
      this.errorMessage = 'Vui lòng nhập đúng email và mật khẩu.';
      return;
    }
    
    if (!this.loginData.email || !this.loginData.password) {
      console.log('Email or password is empty');
      this.isLoading = false;
      this.errorMessage = 'Vui lòng nhập email và mật khẩu';
      return;
    }
    
    console.log('Login form submitted with:', this.loginData);
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.loginData)
      .subscribe({
        next: (response) => {
          console.log('Login response:', response);
          this.authService.saveToken(response.token);
          this.authService.saveRole(response.role);
          this.successMessage = 'Đăng nhập thành công!';
          // Giữ isLoading = true để disable nút cho đến khi redirect
          this.cdr.detectChanges();

          // Redirect based on role
          const targetRoute = response.role === 'ADMIN' ? '/admin' : '/homepage';
          setTimeout(() => {
            this.router.navigate([targetRoute]);
          }, 1000);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false; // Chỉ enable lại nút khi có lỗi
          if (error.status === 0) {
            this.errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
          } else {
            this.errorMessage = this.getErrorMessage(error, 'Đăng nhập thất bại. Vui lòng thử lại.');
          }
          this.cdr.detectChanges();
        }
      });
  }
}
