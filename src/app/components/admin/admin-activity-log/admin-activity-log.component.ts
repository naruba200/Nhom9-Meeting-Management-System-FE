import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { AdminActivityService } from '../../../services/admin-activity.service';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { ActivityLog, ActivityLogResponse, ActivityLogFilterRequest } from '../../../models/admin-activity.models';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-activity-log',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-activity-log.component.html',
  styleUrls: ['./admin-activity-log.component.scss']
})
export class AdminActivityLogComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  userInfo: { email: string; fullName: string } | null = null;
  activities: ActivityLog[] = [];
  loading: boolean = true;
  error: string | null = null;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 20;
  totalElements: number = 0;
  totalPages: number = 0;

  // Filters
  actionTypeFilter: string = '';
  entityTypeFilter: string = '';
  userEmailFilter: string = '';
  startDateFilter: string = '';
  endDateFilter: string = '';

  // Action types and entity types for dropdowns
  actionTypes = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'DOWNLOAD', 'EXPORT', 'OTHER'];
  entityTypes = ['USER', 'FILE', 'MEETING', 'NOTIFICATION', 'TASK', 'INVITATION', 'MINUTES', 'SYSTEM', 'OTHER'];

  constructor(
    private activityService: AdminActivityService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[AdminActivityLog] Skipping loadActivities on server-side rendering');
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadActivities();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadActivities(): void {
    this.loading = true;
    this.error = null;
    console.log('[AdminActivityLog] Loading activities');

    const filter: ActivityLogFilterRequest = {
      page: this.currentPage,
      size: this.pageSize,
      actionType: this.actionTypeFilter || undefined,
      entityType: this.entityTypeFilter || undefined,
      userEmail: this.userEmailFilter || undefined,
      startDate: this.startDateFilter || undefined,
      endDate: this.endDateFilter || undefined,
      sortBy: 'timestamp',
      direction: 'DESC'
    };

    this.activityService.getActivityLogs(filter).subscribe({
      next: (response: ActivityLogResponse) => {
        console.log('[AdminActivityLog] Activities loaded successfully');
        this.activities = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[AdminActivityLog] Error loading activities:', err);
        this.error = 'Không thể tải nhật ký hoạt động. Vui lòng thử lại.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadActivities();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.loadActivities();
    }
  }

  clearFilters(): void {
    this.actionTypeFilter = '';
    this.entityTypeFilter = '';
    this.userEmailFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.currentPage = 0;
    this.loadActivities();
  }

  exportLogs(): void {
    console.log('[AdminActivityLog] Exporting activity logs');
    this.error = null;

    const filter: ActivityLogFilterRequest = {
      actionType: this.actionTypeFilter || undefined,
      entityType: this.entityTypeFilter || undefined,
      userEmail: this.userEmailFilter || undefined,
      startDate: this.startDateFilter || undefined,
      endDate: this.endDateFilter || undefined
    };

    this.activityService.exportActivityLogs(filter).subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) {
          this.error = 'Không có dữ liệu để xuất CSV với bộ lọc hiện tại.';
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `activity-logs-${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('[AdminActivityLog] Error exporting logs:', err);
        this.error = 'Không thể xuất nhật ký. Vui lòng thử lại.';
      }
    });
  }

  getActionTypeBadgeClass(actionType: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (actionType) {
      case 'CREATE':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'UPDATE':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'DELETE':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'LOGIN':
        return `${baseClass} bg-purple-100 text-purple-800`;
      case 'LOGOUT':
        return `${baseClass} bg-gray-100 text-gray-800`;
      case 'VIEW':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'DOWNLOAD':
        return `${baseClass} bg-indigo-100 text-indigo-800`;
      case 'EXPORT':
        return `${baseClass} bg-cyan-100 text-cyan-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getStatusBadgeClass(statusCode: number): string {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-semibold';
    if (statusCode >= 200 && statusCode < 300) {
      return `${baseClass} bg-green-100 text-green-800`;
    } else if (statusCode >= 400 && statusCode < 500) {
      return `${baseClass} bg-yellow-100 text-yellow-800`;
    } else if (statusCode >= 500) {
      return `${baseClass} bg-red-100 text-red-800`;
    }
    return `${baseClass} bg-gray-100 text-gray-800`;
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  }

  isPrevDisabled(): boolean {
    return this.currentPage === 0 || this.loading;
  }

  isNextDisabled(): boolean {
    return this.currentPage >= this.totalPages - 1 || this.loading;
  }

  retry(): void {
    this.loadActivities();
  }
}
