import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OtpRequest } from '../../models/auth.models';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent {
  otpData: OtpRequest = {
    email: '',
    otp: ''
  };
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Lấy email từ localStorage hoặc query params
    const savedEmail = localStorage.getItem('registerEmail');
    const urlParams = new URLSearchParams(window.location.search);
    this.email = urlParams.get('email') || savedEmail || '';
    this.otpData.email = this.email;
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.verifyOtp(this.otpData).subscribe({
      next: (response) => {
        this.successMessage = response;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Xác minh OTP thất bại. Vui lòng thử lại.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  resendOtp(): void {
    this.authService.sendOtp(this.email).subscribe({
      next: () => {
        this.successMessage = 'Đã gửi lại mã OTP. Vui lòng kiểm tra email.';
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Gửi lại OTP thất bại.';
      }
    });
  }
}
