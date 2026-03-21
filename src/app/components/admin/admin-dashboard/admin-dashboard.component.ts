import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { UserMenuComponent } from '../../user-menu/user-menu.component';
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
  imports: [CommonModule, RouterModule, UserMenuComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  userInfo: { email: string; fullName: string } | null = null;
  stats: AdminDashboardStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
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
        },
        error: (err) => {
          this.error = 'Không thể tải dữ liệu dashboard';
          this.loading = false;
          console.error('Error loading admin stats:', err);
        }
      });
  }
}
