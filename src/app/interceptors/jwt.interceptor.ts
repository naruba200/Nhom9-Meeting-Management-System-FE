import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
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

    return next.handle(req);
  }

  private isCloudinaryRequest(url: string): boolean {
    return url.startsWith('https://api.cloudinary.com/');
  }
}
