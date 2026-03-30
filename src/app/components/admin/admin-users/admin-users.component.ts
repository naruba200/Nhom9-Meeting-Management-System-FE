import { ChangeDetectorRef, Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { AdminUserService } from '../../../services/admin-user.service';
import { AdminUser, CreateUserRequest, UpdateUserRequest } from '../../../models/admin-user.models';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminHeaderComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit, OnDestroy {
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

  private userSubscription: Subscription | undefined;

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private adminUserService: AdminUserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[AdminUsersComponent] Bỏ qua load khi đang render phía server');
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    console.log('[AdminUsersComponent] ngOnInit called.');
    this.userSubscription = this.adminUserService.users$.subscribe({
      next: (data) => {
        console.log('[AdminUsersComponent] Received users update:', data);
        this.users = data;
        this.loading = false;
        this.error = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[AdminUsersComponent] Error in users$ subscription:', err);
        this.error = 'Không thể tải danh sách người dùng';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    console.log('[AdminUsersComponent] Calling adminUserService.loadUsers() for initial data.');
    this.adminUserService.loadUsers();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  loadUsers(): void {
    this.adminUserService.loadUsers();
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
    console.log('[AdminUsersComponent] onCreateUser called.');
    this.adminUserService.createUser(this.createForm).subscribe({
      next: (newUser) => {
        console.log('[AdminUsersComponent] User created successfully via component:', newUser);
        this.successMessage = `Đã tạo người dùng ${newUser.email} thành công!`;
        this.closeCreateModal();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('[AdminUsersComponent] Error creating user via component:', err);
        this.error = err.error?.message || 'Không thể tạo người dùng';
      }
    });
  }

  onUpdateUser(): void {
    if (!this.selectedUser) return;
    console.log('[AdminUsersComponent] onUpdateUser called for user:', this.selectedUser.id);
    this.adminUserService.updateUser(this.selectedUser.id, this.editForm).subscribe({
      next: (updatedUser) => {
        console.log('[AdminUsersComponent] User updated successfully via component:', updatedUser);
        this.successMessage = `Đã cập nhật người dùng ${updatedUser.email} thành công!`;
        this.closeEditModal();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('[AdminUsersComponent] Error updating user via component:', err);
        this.error = err.error?.message || 'Không thể cập nhật người dùng';
      }
    });
  }

  onDeleteUser(): void {
    if (!this.selectedUser) return;
    const userEmail = this.selectedUser.email;
    console.log('[AdminUsersComponent] onDeleteUser called for user:', userEmail);
    this.adminUserService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        console.log('[AdminUsersComponent] User deleted successfully via component:', userEmail);
        this.successMessage = `Đã xóa người dùng ${userEmail} thành công!`;
        this.closeDeleteModal();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('[AdminUsersComponent] Error deleting user via component:', err);
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
