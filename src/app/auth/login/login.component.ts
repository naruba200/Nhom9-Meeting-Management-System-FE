import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p class="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email Field -->
          <div class="mb-6">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
              Please enter a valid email
            </p>
          </div>

          <!-- Password Field -->
          <div class="mb-6">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
              Password is required
            </p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between mb-6">
            <label class="flex items-center">
              <input type="checkbox" class="w-4 h-4 text-blue-600 rounded" formControlName="rememberMe" />
              <span class="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" class="text-sm text-blue-600 hover:text-blue-800">Forgot password?</a>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isLoading">Sign In</span>
            <span *ngIf="isLoading">Signing in...</span>
          </button>
        </form>

        <!-- Sign Up Link -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Don't have an account?
            <a routerLink="/signup" class="text-blue-600 font-semibold hover:text-blue-800">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Navigate to home page
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}
