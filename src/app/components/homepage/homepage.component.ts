import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule, UserMenuComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  userInfo: { email: string; fullName: string } | null = null;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
