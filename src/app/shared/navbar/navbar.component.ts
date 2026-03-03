import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-white shadow-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex-shrink-0">
            <a routerLink="/home" class="text-2xl font-bold text-blue-600">
              Meeting Manager
            </a>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex gap-6 items-center">
            <a routerLink="/home" class="text-gray-600 hover:text-blue-600 transition">Home</a>
            <a href="#" class="text-gray-600 hover:text-blue-600 transition">Meetings</a>
            <a href="#" class="text-gray-600 hover:text-blue-600 transition">Settings</a>
          </div>

          <!-- User Menu -->
          <div class="relative group">
            <button class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-6 h-6 text-gray-600"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span class="text-gray-700 hidden sm:inline">{{ currentUser?.fullName || 'User' }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-4 h-4 text-gray-600"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div class="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div class="px-4 py-3 border-b">
                <p class="text-sm font-semibold text-gray-800">{{ currentUser?.fullName || 'User' }}</p>
                <p class="text-xs text-gray-500">{{ currentUser?.email }}</p>
                <p class="text-xs text-blue-600 font-semibold mt-1" *ngIf="currentUser?.role === 'ADMIN'">
                  Admin
                </p>
              </div>
              <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</a>
              <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">Settings</a>
              <button
                (click)="logout()"
                class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 border-t"
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
