import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, UserMenuComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private readonly platformId = inject(PLATFORM_ID);
  userInfo: { email: string; fullName: string } | null = null;
  isMenuOpen = false;
  private userInfoSub: Subscription | null = null;

  constructor(private authService: AuthService) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.userInfo = this.authService.getUserInfo();
    this.userInfoSub = this.authService.userInfo.subscribe((userInfo) => {
      this.userInfo = userInfo;
    });
  }

  ngOnDestroy(): void {
    this.userInfoSub?.unsubscribe();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
