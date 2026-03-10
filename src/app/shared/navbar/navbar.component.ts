import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Regular User Navbar -->
    <nav *ngIf="currentUser?.role === 'USER'" class="bg-gradient-to-r from-blue-50 to-blue-100 shadow-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex-shrink-0">
            <a routerLink="/home" class="text-2xl font-bold text-blue-500">
              Meeting Manager
            </a>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex gap-2 items-center">
            <a routerLink="/home" class="text-gray-700 hover:text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-200 transition-all duration-300 font-medium">Home</a>
            <a routerLink="/calendar" class="text-gray-700 hover:text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-200 transition-all duration-300 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Calendar
            </a>
            <a routerLink="/meetings" class="text-gray-700 hover:text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-200 transition-all duration-300 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Meetings
            </a>
          </div>

          <!-- User Menu -->
          <div class="relative group">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-200 transition-all duration-300 group-hover:shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-6 h-6 text-blue-500"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span class="text-gray-700 hidden sm:inline font-medium">{{ currentUser?.fullName || 'User' }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-4 h-4 text-gray-600 group-hover:rotate-180 transition-transform duration-300"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div class="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div class="px-4 py-3 border-b border-blue-200 bg-blue-50">
                <p class="text-sm font-semibold text-gray-800">{{ currentUser?.fullName || 'User' }}</p>
                <p class="text-xs text-gray-600">{{ currentUser?.email }}</p>
                <p class="text-xs text-green-500 font-semibold mt-1">
                  👤 User
                </p>
              </div>
              <a routerLink="/profile" class="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-500 transition-all duration-200 font-medium">Profile</a>
              <button
                (click)="logout()"
                class="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 border-t border-blue-100 font-medium transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Admin Navbar -->
    <nav *ngIf="currentUser?.role === 'ADMIN'" class="bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex-shrink-0">
            <a routerLink="/home" class="text-2xl font-bold text-purple-600">
              👑 Meeting Manager
            </a>
          </div>

          <!-- Admin Navigation Links -->
          <div class="hidden md:flex gap-2 items-center">
            <a routerLink="/home" class="text-gray-700 hover:text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-all duration-300 font-medium">Dashboard</a>
            <a routerLink="/calendar" class="text-gray-700 hover:text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-all duration-300 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Calendar
            </a>
            <a routerLink="/meetings" class="text-gray-700 hover:text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-all duration-300 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Meetings
            </a>
            <a routerLink="/admin" class="text-gray-700 hover:text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-300 transition-all duration-300 font-medium bg-purple-200">Admin Panel</a>
            <a href="#" class="text-gray-700 hover:text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-all duration-300 font-medium">Reports</a>
          </div>

          <!-- Admin User Menu -->
          <div class="relative group">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-200 transition-all duration-300 group-hover:shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-6 h-6 text-purple-600"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span class="text-gray-700 hidden sm:inline font-medium">{{ currentUser?.fullName || 'Admin' }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-4 h-4 text-gray-600 group-hover:rotate-180 transition-transform duration-300"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Admin Dropdown Menu -->
            <div class="absolute right-0 mt-0 w-56 bg-white rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div class="px-4 py-3 border-b border-purple-200 bg-purple-50">
                <p class="text-sm font-semibold text-gray-800">{{ currentUser?.fullName || 'Admin' }}</p>
                <p class="text-xs text-gray-600">{{ currentUser?.email }}</p>
                <p class="text-xs text-purple-600 font-semibold mt-1">
                  👑 Administrator
                </p>
              </div>
              <div class="px-4 py-3 border-b border-purple-100 bg-purple-50">
                <p class="text-xs font-semibold text-gray-600 mb-2">QUICK ACTIONS</p>
                <a routerLink="/admin" class="block text-sm text-purple-600 hover:text-purple-700 font-medium mb-1">📊 Manage Users</a>
                <a href="#" class="block text-sm text-purple-600 hover:text-purple-700 font-medium">⚙️ System Settings</a>
              </div>
              <a routerLink="/profile" class="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 font-medium">Profile</a>
              <button
                (click)="logout()"
                class="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 border-t border-purple-100 font-medium transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent implements OnInit {
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
