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
}