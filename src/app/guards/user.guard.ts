import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn() && !this.authService.isAdmin()) {
      return true;
    } else if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      // Nếu là admin, redirect về trang admin
      this.router.navigate(['/admin']);
      return false;
    } else {
      // Chưa đăng nhập thì chuyển đến login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
