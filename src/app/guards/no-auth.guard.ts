import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      // Nếu đã đăng nhập, redirect về homepage
      this.router.navigate(['/homepage']);
      return false;
    }
    // Chưa đăng nhập thì cho phép truy cập trang login/register
    return true;
  }
}
