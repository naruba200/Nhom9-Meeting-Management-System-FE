import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { timeout, TimeoutError } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { NotificationService } from '../../services/notification.service';
import { NotificationItem } from '../../models/notification.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  notifications: NotificationItem[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    if (!this.authService.getToken()) {
      this.errorMessage = 'Bạn chưa đăng nhập hoặc phiên đăng nhập không còn hợp lệ.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.notificationService.getMyNotifications().pipe(timeout(10000)).subscribe({
      next: (items) => {
        this.notifications = items;
        this.notificationService.syncUnreadCount(items.filter((item) => !item.read).length);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        if (error instanceof TimeoutError) {
          this.errorMessage = 'Máy chủ không phản hồi. Vui lòng kiểm tra kết nối và thử lại.';
        } else if (error?.status === 0) {
          this.errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.';
        } else if (error?.status === 401) {
          this.errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else {
          this.errorMessage = error?.error?.message || 'Không thể tải danh sách thông báo.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get unreadCount(): number {
    return this.notifications.filter((item) => !item.read).length;
  }

  onNotificationClick(item: NotificationItem): void {
    if (item.read) {
      return;
    }

    this.notificationService.markAsRead(item.id).subscribe({
      next: () => {
        this.notifications = this.notifications.map((notification) =>
          notification.id === item.id ? { ...notification, read: true } : notification
        );
        this.notificationService.syncUnreadCount(this.notifications.filter((notification) => !notification.read).length);
        this.cdr.detectChanges();
      },
      error: () => {
        // Keep unread state unchanged if server update fails
      }
    });
  }

  formatTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
