import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule, ReactiveFormsModule],
  template: `
    <app-navbar></app-navbar>

    <main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <p class="text-gray-600 mt-2">Manage users and system settings</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Total Users</p>
                <p class="text-3xl font-bold text-gray-800">{{ users.length }}</p>
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

          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Admins</p>
                <p class="text-3xl font-bold text-gray-800">{{ getAdminCount() }}</p>
              </div>
              <div class="bg-purple-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-purple-600">
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
                <p class="text-3xl font-bold text-gray-800">{{ getUserCount() }}</p>
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
                  <path d="M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6"></path>
                  <path d="M4.22 19.78l4.24-4.24m2.12-2.12l4.24-4.24M19.78 19.78l-4.24-4.24m-2.12-2.12l-4.24-4.24"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="bg-white rounded-lg shadow-md mb-8">
          <div class="border-b border-gray-200">
            <div class="flex gap-6 px-6">
              <button
                (click)="activeTab = 'users'"
                [class.border-blue-500]="activeTab === 'users'"
                [class.text-blue-500]="activeTab === 'users'"
                class="py-4 px-1 border-b-2 border-transparent font-medium text-gray-600 hover:text-blue-500 transition"
              >
                👥 User Management
              </button>
              <button
                (click)="activeTab = 'system'"
                [class.border-blue-500]="activeTab === 'system'"
                [class.text-blue-500]="activeTab === 'system'"
                class="py-4 px-1 border-b-2 border-transparent font-medium text-gray-600 hover:text-blue-500 transition"
              >
                ⚙️ System Settings
              </button>
              <button
                (click)="activeTab = 'logs'"
                [class.border-blue-500]="activeTab === 'logs'"
                [class.text-blue-500]="activeTab === 'logs'"
                class="py-4 px-1 border-b-2 border-transparent font-medium text-gray-600 hover:text-blue-500 transition"
              >
                📋 Activity Logs
              </button>
            </div>
          </div>

          <!-- User Management Tab -->
          <div *ngIf="activeTab === 'users'" class="p-8">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-800">User Management</h2>
              <button
                (click)="toggleAddUserForm()"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                {{ showAddUserForm ? '✕ Cancel' : '+ Add User' }}
              </button>
            </div>

            <!-- Add User Form -->
            <div *ngIf="showAddUserForm" class="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
              <h3 class="text-lg font-bold text-gray-800 mb-4">Add New User</h3>
              <form [formGroup]="addUserForm" (ngSubmit)="onAddUser()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    formControlName="fullName"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    formControlName="email"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Role</label>
                  <select
                    formControlName="role"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Status</label>
                  <select
                    formControlName="status"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <button
                    type="submit"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>

            <!-- Search & Filter -->
            <div class="mb-6 flex gap-4">
              <input
                type="text"
                placeholder="Search users..."
                [(ngModel)]="searchTerm"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select
                [(ngModel)]="filterRole"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
            </div>

            <!-- Users Table -->
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                    <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of getFilteredUsers()" class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="px-6 py-4 text-gray-800 font-medium">{{ user.fullName }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ user.email }}</td>
                    <td class="px-6 py-4">
                      <span *ngIf="user.role === 'ADMIN'" class="inline-block bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
                        👑 Admin
                      </span>
                      <span *ngIf="user.role === 'USER'" class="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                        👤 User
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span *ngIf="user.status === 'active'" class="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                        Active
                      </span>
                      <span *ngIf="user.status === 'inactive'" class="inline-block bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                        Inactive
                      </span>
                    </td>
                    <td class="px-6 py-4 text-gray-600">{{ user.createdAt }}</td>
                    <td class="px-6 py-4 text-center space-x-2">
                      <button class="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1 rounded transition">Edit</button>
                      <button (click)="onDeleteUser(user.id)" class="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded transition">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- System Settings Tab -->
          <div *ngIf="activeTab === 'system'" class="p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-semibold text-gray-800">System Maintenance Mode</p>
                    <p class="text-gray-600 text-sm mt-1">Enable maintenance mode to prevent user access</p>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-semibold text-gray-800">Auto Backup</p>
                    <p class="text-gray-600 text-sm mt-1">Enable automatic daily backups</p>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" checked />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-semibold text-gray-800">User Registration</p>
                    <p class="text-gray-600 text-sm mt-1">Allow new users to register</p>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" checked />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-semibold text-gray-800">Email Notifications</p>
                    <p class="text-gray-600 text-sm mt-1">Enable email notifications for system alerts</p>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" checked />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>

              <div class="border-t border-gray-200 pt-6 mt-6">
                <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition mr-2">
                  Save Settings
                </button>
                <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition">
                  Reset to Default
                </button>
              </div>
            </div>
          </div>

          <!-- Activity Logs Tab -->
          <div *ngIf="activeTab === 'logs'" class="p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Activity Logs</h2>
            <div class="space-y-3">
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-semibold text-gray-800">User Login</p>
                    <p class="text-gray-600 text-sm">Admin User (admin@example.com) logged in</p>
                  </div>
                  <span class="text-gray-500 text-xs">10:30 AM Today</span>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-semibold text-gray-800">User Created</p>
                    <p class="text-gray-600 text-sm">New user created: Jane Smith (jane@example.com)</p>
                  </div>
                  <span class="text-gray-500 text-xs">9:15 AM Today</span>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-semibold text-gray-800">System Update</p>
                    <p class="text-gray-600 text-sm">System settings updated by Admin User</p>
                  </div>
                  <span class="text-gray-500 text-xs">8:45 AM Today</span>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-semibold text-gray-800">User Deleted</p>
                    <p class="text-gray-600 text-sm">User account deleted: old.user@example.com</p>
                  </div>
                  <span class="text-gray-500 text-xs">7:20 AM Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <style>
      .toggle {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 24px;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
      }

      input:checked + .slider {
        background-color: #2563eb;
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }
    </style>
  `,
  styles: []
})
export class AdminComponent implements OnInit {
  currentUser: any;
  activeTab: 'users' | 'system' | 'logs' = 'users';
  showAddUserForm = false;
  searchTerm = '';
  filterRole = '';
  addUserForm: FormGroup;

  users: User[] = [
    { id: '1', fullName: 'Admin User', email: 'admin@example.com', role: 'ADMIN', createdAt: 'March 1, 2026', status: 'active' },
    { id: '2', fullName: 'John Doe', email: 'user@example.com', role: 'USER', createdAt: 'March 1, 2026', status: 'active' },
    { id: '3', fullName: 'Jane Smith', email: 'jane.smith@example.com', role: 'USER', createdAt: 'March 2, 2026', status: 'active' },
    { id: '4', fullName: 'Bob Wilson', email: 'bob.wilson@example.com', role: 'USER', createdAt: 'March 2, 2026', status: 'inactive' },
    { id: '5', fullName: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'ADMIN', createdAt: 'March 1, 2026', status: 'active' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.addUserForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['USER', Validators.required],
      status: ['active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    if (!this.currentUser || this.currentUser.role !== 'ADMIN') {
      this.router.navigate(['/home']);
      return;
    }
  }

  toggleAddUserForm(): void {
    this.showAddUserForm = !this.showAddUserForm;
    if (!this.showAddUserForm) {
      this.addUserForm.reset();
    }
  }

  onAddUser(): void {
    if (this.addUserForm.valid) {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...this.addUserForm.value,
        createdAt: new Date().toLocaleDateString()
      };
      this.users.push(newUser);
      this.addUserForm.reset();
      this.showAddUserForm = false;
      alert('User created successfully!');
    }
  }

  onDeleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.users = this.users.filter(u => u.id !== userId);
      alert('User deleted successfully!');
    }
  }

  getFilteredUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch = user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = !this.filterRole || user.role === this.filterRole;
      return matchesSearch && matchesRole;
    });
  }

  getAdminCount(): number {
    return this.users.filter(user => user.role === 'ADMIN').length;
  }

  getUserCount(): number {
    return this.users.filter(user => user.role === 'USER').length;
  }
}
