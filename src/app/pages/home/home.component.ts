import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Welcome Section -->
        <div class="mb-12">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {{ currentUser?.fullName }}!
          </h1>
          <p class="text-gray-600">
            <span *ngIf="currentUser?.role === 'ADMIN'" class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              Admin
            </span>
            <span *ngIf="currentUser?.role === 'USER'" class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              User
            </span>
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Upcoming Meetings</p>
                <p class="text-3xl font-bold text-gray-800">5</p>
              </div>
              <div class="bg-blue-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-blue-600">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Completed Meetings</p>
                <p class="text-3xl font-bold text-gray-800">12</p>
              </div>
              <div class="bg-green-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-green-600">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Total Participants</p>
                <p class="text-3xl font-bold text-gray-800">24</p>
              </div>
              <div class="bg-purple-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-purple-600">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Only Section -->
        <div *ngIf="currentUser?.role === 'ADMIN'" class="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition">
              Manage Users
            </button>
            <button class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition">
              View Reports
            </button>
            <button class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition">
              System Settings
            </button>
            <button class="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition">
              User Logs
            </button>
          </div>
        </div>

        <!-- Recent Meetings -->
        <div class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Recent Meetings</h2>
          <div class="space-y-4">
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-gray-800">Q1 Planning Meeting</h3>
                  <p class="text-gray-600 text-sm">March 5, 2026 at 10:00 AM</p>
                  <p class="text-gray-500 text-sm mt-2">Conference Room A • 8 participants</p>
                </div>
                <button class="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition">
                  Join
                </button>
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-gray-800">Team Sync</h3>
                  <p class="text-gray-600 text-sm">March 6, 2026 at 2:00 PM</p>
                  <p class="text-gray-500 text-sm mt-2">Virtual • 5 participants</p>
                </div>
                <button class="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition">
                  Join
                </button>
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-gray-800">Client Presentation</h3>
                  <p class="text-gray-600 text-sm">March 7, 2026 at 3:30 PM</p>
                  <p class="text-gray-500 text-sm mt-2">Main Board Room • 12 participants</p>
                </div>
                <button class="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = this.authService.getUser();
  }
}
