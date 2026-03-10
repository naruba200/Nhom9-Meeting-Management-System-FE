import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  template: `
    <app-navbar></app-navbar>

    <!-- REGULAR USER HOME -->
    <main *ngIf="currentUser?.role === 'USER'" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Welcome Section -->
        <div class="mb-12">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {{ currentUser?.fullName }}! 👋
          </h1>
          <p class="text-gray-600 text-lg">Manage and join your meetings</p>
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
              <div class="bg-blue-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-blue-600">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Meetings -->
        <div class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">📅 Recent Meetings</h2>
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

    <!-- ADMIN HOME -->
    <main *ngIf="currentUser?.role === 'ADMIN'" class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Welcome Section -->
        <div class="mb-12">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, Admin {{ currentUser?.fullName }}! 👑
          </h1>
          <p class="text-gray-600 text-lg">Manage your system and monitor activities</p>
        </div>

        <!-- Admin Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Total Users</p>
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

          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Admins</p>
                <p class="text-3xl font-bold text-gray-800">2</p>
              </div>
              <div class="bg-indigo-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-indigo-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                  <path d="M12 12c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5c0-2.33-4.67-3.5-7-3.5z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Regular Users</p>
                <p class="text-3xl font-bold text-gray-800">22</p>
              </div>
              <div class="bg-green-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-green-600">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Active Sessions</p>
                <p class="text-3xl font-bold text-gray-800">8</p>
              </div>
              <div class="bg-yellow-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-yellow-600">
                  <circle cx="12" cy="12" r="1"></circle>
                  <path d="M12 1v6m0 6v6"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Control Panel -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <a routerLink="/admin" class="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg shadow-md p-8 transition transform hover:scale-105">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold">Admin Panel</h3>
                <p class="text-purple-100 mt-2">Manage users and system settings</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-12 h-12 text-purple-200">
                <circle cx="12" cy="12" r="1"></circle>
                <path d="M12 1v6m0 6v6"></path>
                <path d="M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24"></path>
                <path d="M1 12h6m6 0h6"></path>
                <path d="M4.22 19.78l4.24-4.24m2.12-2.12l4.24-4.24"></path>
                <path d="M19.78 19.78l-4.24-4.24m-2.12-2.12l-4.24-4.24"></path>
              </svg>
            </div>
          </a>

          <a href="#" class="bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg shadow-md p-8 transition transform hover:scale-105">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold">System Reports</h3>
                <p class="text-indigo-100 mt-2">View analytics and user activity logs</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-12 h-12 text-indigo-200">
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </a>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">⚡ Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button class="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 font-semibold py-3 px-6 rounded-lg transition">
              👥 Add New User
            </button>
            <button class="bg-green-50 hover:bg-green-100 border-2 border-green-200 text-green-700 font-semibold py-3 px-6 rounded-lg transition">
              📊 View Statistics
            </button>
            <button class="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 text-purple-700 font-semibold py-3 px-6 rounded-lg transition">
              ⚙️ System Settings
            </button>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">📋 Recent System Activities</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div>
                <p class="font-semibold text-gray-800">Admin User logged in</p>
                <p class="text-gray-600 text-sm">admin@example.com</p>
              </div>
              <span class="text-gray-500 text-sm">10:30 AM Today</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div>
                <p class="font-semibold text-gray-800">New user created</p>
                <p class="text-gray-600 text-sm">Jane Smith (jane@example.com)</p>
              </div>
              <span class="text-gray-500 text-sm">9:15 AM Today</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div>
                <p class="font-semibold text-gray-800">System update completed</p>
                <p class="text-gray-600 text-sm">Database backup and maintenance tasks</p>
              </div>
              <span class="text-gray-500 text-sm">8:00 AM Today</span>
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
