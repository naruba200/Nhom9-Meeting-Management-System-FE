import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isCloudinaryRequest(req.url)) {
      return next.handle(req);
    }

    const token = this.authService.getToken();

    if (req.url.includes('/api/auth/profile')) {
      console.log(`[JwtInterceptor] ${req.method} ${req.url} | token ${token ? 'found' : 'missing'}`);
    }
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Xử lý khi nhận 401 Unauthorized
        if (error.status === 401) {
          console.warn('[JwtInterceptor] 401 Unauthorized - Token expired or invalid. Logging out...');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private isCloudinaryRequest(url: string): boolean {
    return url.startsWith('https://api.cloudinary.com/');
  }
}
