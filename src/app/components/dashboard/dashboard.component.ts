import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  userInfo: { email: string; fullName: string } | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  logout(): void {
    this.authService.removeToken();
    this.router.navigate(['/login']);
  }
}
