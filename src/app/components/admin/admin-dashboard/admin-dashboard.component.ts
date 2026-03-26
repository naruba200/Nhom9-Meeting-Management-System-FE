import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { UserMenuComponent } from '../../user-menu/user-menu.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { environment } from '../../../../environments/environment';

interface AdminDashboardStats {
  totalUsers: number;
  totalMeetings: number;
  activeMeetings: number;
  totalNotifications: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  userInfo: { email: string; fullName: string } | null = null;
  stats: AdminDashboardStats | null = null;
  loading = true;
  error: string | null = null;
  backupLoading = false;
  cloudBackupLoading = false;
  backupMessage: string | null = null;
  backupError: string | null = null;

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[AdminDashboardComponent] Bỏ qua loadStats khi đang render phía server');
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;
    this.http.get<AdminDashboardStats>(`${environment.apiUrl}/api/admin/dashboard/stats`)
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Không thể tải dữ liệu dashboard';
          this.loading = false;
          this.cdr.detectChanges();
          console.error('Error loading admin stats:', err);
        }
      });
  }

  createDatabaseBackup(): void {
    this.backupLoading = true;
    this.backupMessage = null;
    this.backupError = null;

    this.http.post(`${environment.apiUrl}/api/admin/database/backup`, {}, {
      observe: 'response',
      responseType: 'blob'
    }).subscribe({
      next: (response) => {
        const disposition = response.headers.get('content-disposition') || '';
        const fileNameMatch = disposition.match(/filename="?([^\"]+)"?/i);
        const fileName = fileNameMatch?.[1] || `meeting-manage-backup-${Date.now()}.sql`;

        const blob = response.body;
        if (!blob || blob.size === 0) {
          this.backupError = 'Không thể tạo bản sao dữ liệu. Vui lòng thử lại.';
          this.backupLoading = false;
          this.cdr.detectChanges();
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.backupMessage = 'Đã tạo file SQL dump cơ sở dữ liệu thành công.';
        this.backupLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating database backup:', err);
        this.backupError = 'Không thể sao lưu cơ sở dữ liệu. Vui lòng thử lại.';
        this.backupLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createCloudinaryBackupNow(): void {
    this.cloudBackupLoading = true;
    this.backupMessage = null;
    this.backupError = null;

    this.http.post(`${environment.apiUrl}/api/admin/database/backup/cloudinary`, {}, {
      responseType: 'text'
    }).subscribe({
      next: () => {
        this.backupMessage = 'Đã tạo và tải backup lên Cloudinary thành công.';
        this.cloudBackupLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating cloudinary backup:', err);
        this.backupError = 'Không thể tạo backup lên Cloudinary. Vui lòng thử lại.';
        this.cloudBackupLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}