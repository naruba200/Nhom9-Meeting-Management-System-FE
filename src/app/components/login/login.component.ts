import { Component } from '@angular/core';
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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('Login component initialized');
  }

  onSubmit(): void {
    console.log('onSubmit called!');
    
    if (!this.loginData.email || !this.loginData.password) {
      console.log('Email or password is empty');
      this.errorMessage = 'Vui lòng nhập email và mật khẩu';
      return;
    }
    
    console.log('Login form submitted with:', this.loginData);
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        this.authService.saveToken(response.token);
        this.successMessage = 'Đăng nhập thành công!';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        this.isLoading = false;
      },
      complete: () => {
        console.log('Login request completed');
        this.isLoading = false;
      }
    });
  }
}
