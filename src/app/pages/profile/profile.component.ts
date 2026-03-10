import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ReactiveFormsModule],
  template: `
    <app-navbar></app-navbar>

    <main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-800">My Profile</h1>
          <p class="text-gray-600 mt-2">Manage your personal information</p>
        </div>

        <!-- Profile Card -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <!-- Header Background -->
          <div class="h-32 bg-gradient-to-r from-blue-400 to-blue-600"></div>

          <!-- Profile Content -->
          <div class="px-6 py-8">
            <!-- Profile Avatar & Basic Info -->
            <div class="flex flex-col sm:flex-row gap-6 mb-8 -mt-16 relative z-10">
              <div class="flex flex-col items-center sm:items-start">
                <div class="w-32 h-32 bg-white rounded-lg shadow-lg border-4 border-blue-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="w-20 h-20 text-blue-400">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <h2 class="text-3xl font-bold text-gray-800">{{ currentUser?.fullName }}</h2>
                <p class="text-gray-600 text-lg">{{ currentUser?.email }}</p>
                <div class="mt-3">
                  <span *ngIf="currentUser?.role === 'ADMIN'" class="inline-block bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    👑 Admin
                  </span>
                  <span *ngIf="currentUser?.role === 'USER'" class="inline-block bg-green-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    👤 User
                  </span>
                </div>
              </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="border-b border-gray-200 mb-8">
              <div class="flex gap-6">
                <button
                  (click)="activeTab = 'overview'"
                  [class.border-blue-500]="activeTab === 'overview'"
                  [class.text-blue-500]="activeTab === 'overview'"
                  class="pb-3 px-1 border-b-2 border-transparent font-medium text-gray-600 hover:text-blue-500 transition"
                >
                  Overview
                </button>
                <button
                  (click)="activeTab = 'edit'"
                  [class.border-blue-500]="activeTab === 'edit'"
                  [class.text-blue-500]="activeTab === 'edit'"
                  class="pb-3 px-1 border-b-2 border-transparent font-medium text-gray-600 hover:text-blue-500 transition"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            <!-- Overview Tab -->
            <div *ngIf="activeTab === 'overview'" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-blue-50 rounded-lg p-6">
                  <p class="text-gray-600 text-sm font-semibold">Full Name</p>
                  <p class="text-gray-800 text-lg font-bold mt-2">{{ currentUser?.fullName }}</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-6">
                  <p class="text-gray-600 text-sm font-semibold">Email</p>
                  <p class="text-gray-800 text-lg font-bold mt-2">{{ currentUser?.email }}</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-6">
                  <p class="text-gray-600 text-sm font-semibold">User ID</p>
                  <p class="text-gray-800 text-lg font-bold mt-2">{{ currentUser?.id }}</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-6">
                  <p class="text-gray-600 text-sm font-semibold">Role</p>
                  <p class="text-gray-800 text-lg font-bold mt-2">{{ currentUser?.role }}</p>
                </div>
              </div>

              <!-- Activity Section -->
              <div class="mt-8 pt-8 border-t border-gray-200">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Account Activity</h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span class="text-gray-600">Last Login</span>
                    <span class="text-gray-800 font-semibold">Today at 10:30 AM</span>
                  </div>
                  <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span class="text-gray-600">Account Created</span>
                    <span class="text-gray-800 font-semibold">March 1, 2026</span>
                  </div>
                  <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span class="text-gray-600">Last Password Change</span>
                    <span class="text-gray-800 font-semibold">February 20, 2026</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Edit Tab -->
            <div *ngIf="activeTab === 'edit'" class="space-y-6 max-w-2xl">
              <form [formGroup]="profileForm" (ngSubmit)="onSave()">
                <!-- Full Name -->
                <div class="mb-6">
                  <label class="block text-gray-700 font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    formControlName="fullName"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <!-- Email -->
                <div class="mb-6">
                  <label class="block text-gray-700 font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    formControlName="email"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <!-- Phone (Optional) -->
                <div class="mb-6">
                  <label class="block text-gray-700 font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    formControlName="phone"
                    placeholder="Enter your phone number"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <!-- Bio (Optional) -->
                <div class="mb-6">
                  <label class="block text-gray-700 font-semibold mb-2">Bio</label>
                  <textarea
                    formControlName="bio"
                    placeholder="Tell us about yourself"
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  ></textarea>
                </div>

                <!-- Buttons -->
                <div class="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    (click)="onCancel()"
                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Security Section -->
        <div class="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">Security</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button class="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg p-6 text-left transition">
              <p class="text-lg font-semibold text-gray-800">Change Password</p>
              <p class="text-gray-600 text-sm mt-2">Update your password regularly to stay secure</p>
            </button>
            <button class="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg p-6 text-left transition">
              <p class="text-lg font-semibold text-gray-800">Two-Factor Authentication</p>
              <p class="text-gray-600 text-sm mt-2">Add an extra layer of security to your account</p>
            </button>
            <button class="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg p-6 text-left transition">
              <p class="text-lg font-semibold text-gray-800">Active Sessions</p>
              <p class="text-gray-600 text-sm mt-2">View and manage your active sessions</p>
            </button>
            <button class="bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-lg p-6 text-left transition">
              <p class="text-lg font-semibold text-red-600">Delete Account</p>
              <p class="text-red-600 text-sm mt-2">Permanently delete your account and data</p>
            </button>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  currentUser: any;
  activeTab: 'overview' | 'edit' = 'overview';
  profileForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = this.authService.getUser();
    this.profileForm.patchValue({
      fullName: this.currentUser?.fullName,
      email: this.currentUser?.email
    });
  }

  onSave(): void {
    if (this.profileForm.valid) {
      alert('Profile updated successfully!');
      this.activeTab = 'overview';
    }
  }

  onCancel(): void {
    this.activeTab = 'overview';
  }
}
