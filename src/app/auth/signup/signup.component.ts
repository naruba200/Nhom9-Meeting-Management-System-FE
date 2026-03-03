import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Create Account</h1>
          <p class="text-gray-600 mt-2">Join us today</p>
        </div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          <!-- Full Name Field -->
          <div class="mb-4">
            <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              id="fullName"
              type="text"
              formControlName="fullName"
              placeholder="John Doe"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              [class.border-red-500]="signupForm.get('fullName')?.invalid && signupForm.get('fullName')?.touched"
            />
            <p *ngIf="signupForm.get('fullName')?.invalid && signupForm.get('fullName')?.touched" class="text-red-500 text-sm mt-1">
              Full name is required
            </p>
          </div>

          <!-- Email Field -->
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              [class.border-red-500]="signupForm.get('email')?.invalid && signupForm.get('email')?.touched"
            />
            <p *ngIf="signupForm.get('email')?.invalid && signupForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
              Please enter a valid email
            </p>
          </div>

          <!-- Password Field -->
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="At least 6 characters"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              [class.border-red-500]="signupForm.get('password')?.invalid && signupForm.get('password')?.touched"
            />
            <p *ngIf="signupForm.get('password')?.hasError('required') && signupForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
              Password is required
            </p>
            <p *ngIf="signupForm.get('password')?.hasError('minlength') && signupForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
              Password must be at least 6 characters
            </p>
          </div>

          <!-- Confirm Password Field -->
          <div class="mb-6">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Confirm your password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              [class.border-red-500]="signupForm.get('confirmPassword')?.invalid && signupForm.get('confirmPassword')?.touched"
            />
            <p *ngIf="signupForm.getError('passwordMismatch') && signupForm.get('confirmPassword')?.touched" class="text-red-500 text-sm mt-1">
              Passwords do not match
            </p>
          </div>

          <!-- Terms & Conditions -->
          <div class="mb-6">
            <label class="flex items-start">
              <input
                type="checkbox"
                class="w-4 h-4 text-indigo-600 rounded mt-1"
                formControlName="agreeTerms"
              />
              <span class="ml-2 text-sm text-gray-600">
                I agree to the
                <a href="#" class="text-indigo-600 hover:text-indigo-800">Terms & Conditions</a>
                and
                <a href="#" class="text-indigo-600 hover:text-indigo-800">Privacy Policy</a>
              </span>
            </label>
            <p *ngIf="signupForm.get('agreeTerms')?.invalid && signupForm.get('agreeTerms')?.touched" class="text-red-500 text-sm mt-1">
              You must agree to the terms
            </p>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="signupForm.invalid || isLoading"
            class="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isLoading">Create Account</span>
            <span *ngIf="isLoading">Creating account...</span>
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Already have an account?
            <a routerLink="/login" class="text-indigo-600 font-semibold hover:text-indigo-800">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        agreeTerms: [false, [Validators.requiredTrue]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { fullName, email, password } = this.signupForm.value;

      this.authService.signup(fullName, email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Navigate to login or dashboard
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Signup failed. Please try again.';
        }
      });
    }
  }
}
