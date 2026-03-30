import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ResetPasswordRequest } from '../../models/auth.models';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordData: ResetPasswordRequest = {
    token: '',
    newPassword: ''
  };

  confirmPassword: string = '';
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin';
      this.cdr.detectChanges();
      return;
    }

    if (!this.resetPasswordData.token.trim()) {
      this.errorMessage = 'Vui lòng nhập token từ email';
      this.cdr.detectChanges();
      return;
    }

    if (!this.resetPasswordData.newPassword || this.resetPasswordData.newPassword.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự';
      this.cdr.detectChanges();
      return;
    }

    if (this.resetPasswordData.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.authService.resetPassword(this.resetPasswordData).subscribe({
      next: (response) => {
        this.successMessage = response || 'Mật khẩu đã được đặt lại thành công!';
        this.cdr.detectChanges();
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 400) {
      return 'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu token mới.';
    }
    if (error.status === 404) {
      return 'Người dùng không tồn tại.';
    }
    if (error.status === 500) {
      return 'Lỗi máy chủ. Vui lòng thử lại sau.';
    }
    return error.error?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
  }
}
