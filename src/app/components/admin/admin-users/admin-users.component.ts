import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AdminUserService } from '../../../services/admin-user.service';
import { AdminUser, CreateUserRequest, UpdateUserRequest } from '../../../models/admin-user.models';
import { UserMenuComponent } from '../../user-menu/user-menu.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UserMenuComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  userInfo: { email: string; fullName: string } | null = null;
  users: AdminUser[] = [];
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedUser: AdminUser | null = null;

  // Create form
  createForm: CreateUserRequest = {
    email: '',
    fullName: '',
    phone: '',
    password: '',
    role: 'USER'
  };

  // Edit form
  editForm: UpdateUserRequest = {
    fullName: '',
    phone: '',
    role: 'USER',
    enabled: true
  };

  constructor(
    private authService: AuthService,
    private adminUserService: AdminUserService,
    private router: Router
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.adminUserService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách người dùng';
        this.loading = false;
        console.error('Error loading users:', err);
      }
    });
  }

  openCreateModal(): void {
    this.createForm = {
      email: '',
      fullName: '',
      phone: '',
      password: '',
      role: 'USER'
    };
    this.showCreateModal = true;
    this.successMessage = null;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  openEditModal(user: AdminUser): void {
    this.selectedUser = user;
    this.editForm = {
      fullName: user.fullName,
      phone: user.phone || '',
      role: user.role,
      enabled: user.enabled
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  openDeleteModal(user: AdminUser): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  onCreateUser(): void {
    this.adminUserService.createUser(this.createForm).subscribe({
      next: (newUser) => {
        this.successMessage = `Đã tạo người dùng ${newUser.email} thành công!`;
        this.closeCreateModal();
        this.loadUsers();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.error = err.error?.message || 'Không thể tạo người dùng';
      }
    });
  }

  onUpdateUser(): void {
    if (!this.selectedUser) return;

    this.adminUserService.updateUser(this.selectedUser.id, this.editForm).subscribe({
      next: (updatedUser) => {
        this.successMessage = `Đã cập nhật người dùng ${updatedUser.email} thành công!`;
        this.closeEditModal();
        this.loadUsers();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.error = err.error?.message || 'Không thể cập nhật người dùng';
      }
    });
  }

  onDeleteUser(): void {
    if (!this.selectedUser) return;

    const userEmail = this.selectedUser.email;
    this.adminUserService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.successMessage = `Đã xóa người dùng ${userEmail} thành công!`;
        this.closeDeleteModal();
        this.loadUsers();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        this.error = err.error?.message || 'Không thể xóa người dùng';
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'badge-admin' : 'badge-user';
  }

  getStatusBadgeClass(enabled: boolean): string {
    return enabled ? 'badge-active' : 'badge-inactive';
  }

  getStatusText(enabled: boolean): string {
    return enabled ? 'Hoạt động' : 'Khóa';
  }
}
