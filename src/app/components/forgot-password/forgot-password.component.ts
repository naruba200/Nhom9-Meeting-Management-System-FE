import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ForgotPasswordRequest } from '../../models/auth.models';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordData: ForgotPasswordRequest = {
    email: ''
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
  ) {}

  onSubmit(form: NgForm): void {
    if (this.isLoading) {
      return;
    }

    if (form.invalid || !this.forgotPasswordData.email) {
      form.control.markAllAsTouched();
      this.isLoading = false;
      this.errorMessage = 'Vui lòng nhập email hợp lệ để lấy lại mật khẩu.';
      this.successMessage = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.forgotPasswordData)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.successMessage = response || 'Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn. Bạn sẽ được chuyển hướng đến trang đặt lại mật khẩu...';
          this.cdr.detectChanges();
          
          // Redirect to reset password page after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/reset-password']);
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error, 'Không thể gửi yêu cầu quên mật khẩu. Vui lòng thử lại.');
        }
      });
  }
}
