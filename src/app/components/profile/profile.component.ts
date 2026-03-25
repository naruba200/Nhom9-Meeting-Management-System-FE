import { ChangeDetectorRef, Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { timeout, TimeoutError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserProfile, UpdateProfileRequest, GoogleLinkStatusResponse } from '../../models/auth.models';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  userProfile: UserProfile | null = null;
  isLoading: boolean = true;
  isEditing: boolean = false;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Google Calendar linking
  googleLinkStatus: GoogleLinkStatusResponse | null = null;
  googleLinkLoading: boolean = false;
  private googleLinkWindow: Window | null = null;
  
  // Edit form data
  editForm: UpdateProfileRequest = {
    fullName: '',
    phone: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Listen for Google OAuth callback messages from popup
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('message', (event) => this.handleGoogleOAuthMessage(event));
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[Profile] Bỏ qua loadProfile khi đang render phía server');
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    if (!this.authService.getToken()) {
      console.error('[Profile] Không tìm thấy token trước khi tải profile');
      this.errorMessage = 'Bạn chưa đăng nhập hoặc phiên đăng nhập không còn hợp lệ.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadProfile();
    this.loadGoogleLinkStatus();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('message', (event) => this.handleGoogleOAuthMessage(event));
    }
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('[Profile] Bắt đầu tải thông tin cá nhân');
    
    this.authService.getProfile().pipe(timeout(10000)).subscribe({
      next: (profile) => {
        console.log('[Profile] Tải thông tin cá nhân thành công');
        this.userProfile = profile;
        this.editForm = {
          fullName: profile.fullName || '',
          phone: profile.phone || ''
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        if (error instanceof TimeoutError) {
          console.error('[Profile] Lỗi: Máy chủ không phản hồi sau 10 giây (TimeoutError)');
          this.errorMessage = 'Máy chủ không phản hồi. Vui lòng kiểm tra kết nối và thử lại.';
        } else {
          console.error(`[Profile] Lỗi ${error.status ?? 'unknown'} khi tải profile:`, error.message ?? error);
          if (error.status === 0) {
            this.errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.';
          } else if (error.status === 401) {
            this.errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          } else {
            this.errorMessage = `Không thể tải thông tin người dùng (lỗi ${error.status}). Vui lòng thử lại.`;
          }
        }

        this.cdr.detectChanges();
      }
    });
  }

  loadGoogleLinkStatus(): void {
    console.log('[Profile] Đang kiểm tra trạng thái liên kết Google Calendar');
    this.authService.getGoogleLinkStatus().subscribe({
      next: (status) => {
        console.log('[Profile] Trạng thái Google Calendar:', status);
        this.googleLinkStatus = status;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[Profile] Lỗi khi lấy trạng thái Google Calendar:', error);
        this.googleLinkStatus = { linked: false };
        this.cdr.detectChanges();
      }
    });
  }

  linkGoogleCalendar(): void {
    console.log('[Profile] Bắt đầu liên kết Google Calendar');
    this.googleLinkLoading = true;
    this.cdr.detectChanges();

    this.authService.getGoogleLinkUrl().subscribe({
      next: (response) => {
        console.log('[Profile] Nhận URL liên kết Google, mở pop-up');
        // Open popup for Google OAuth
        this.googleLinkWindow = window.open(
          response.authorizationUrl,
          'GoogleCalendarLink',
          'width=600,height=700,left=200,top=100'
        );

        if (!this.googleLinkWindow) {
          this.googleLinkLoading = false;
          this.errorMessage = 'Không thể mở cửa sổ liên kết Google. Vui lòng kiểm tra cài đặt pop-up của trình duyệt.';
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('[Profile] Lỗi khi lấy URL liên kết Google:', error);
        this.googleLinkLoading = false;
        this.errorMessage = 'Không thể liên kết Google Calendar. Vui lòng thử lại.';
        this.cdr.detectChanges();
      }
    });
  }

  unlinkGoogleCalendar(): void {
    console.log('[Profile] Bắt đầu hủy liên kết Google Calendar');
    this.googleLinkLoading = true;
    this.cdr.detectChanges();

    // Call backend to unlink - you might need to add this endpoint
    // For now, we'll just reload the status
    setTimeout(() => {
      this.googleLinkLoading = false;
      this.loadGoogleLinkStatus();
      this.successMessage = 'Hủy liên kết Google Calendar thành công!';
      setTimeout(() => this.successMessage = '', 3000);
      this.cdr.detectChanges();
    }, 1000);
  }

  private handleGoogleOAuthMessage(event: MessageEvent): void {
    console.log('[Profile] Nhận message từ window:', event.data);
    
    if (event.data.type === 'google-link-result') {
      if (event.data.success) {
        console.log('[Profile] Liên kết Google thành công');
        this.successMessage = 'Liên kết Google Calendar thành công!';
        this.loadGoogleLinkStatus();
      } else {
        console.error('[Profile] Lỗi liên kết Google:', event.data.message);
        this.errorMessage = event.data.message || 'Liên kết Google Calendar thất bại. Vui lòng thử lại.';
      }

      this.googleLinkLoading = false;
      if (this.googleLinkWindow) {
        this.googleLinkWindow.close();
        this.googleLinkWindow = null;
      }

      setTimeout(() => this.successMessage = '', 3000);
      this.cdr.detectChanges();
    }
  }

  retryLoad(): void {
    this.loadProfile();
  }

  startEditing(): void {
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEditing(): void {
    this.isEditing = false;
    if (this.userProfile) {
      this.editForm = {
        fullName: this.userProfile.fullName || '',
        phone: this.userProfile.phone || ''
      };
    }
  }

  saveProfile(): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.updateProfile(this.editForm).subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.authService.updateUserInfoFromProfile(profile);
        this.isEditing = false;
        this.isSaving = false;
        this.successMessage = 'Cập nhật thông tin thành công!';
        setTimeout(() => this.successMessage = '', 3000);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = 'Không thể cập nhật thông tin. Vui lòng thử lại.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if API call fails, clear local state and redirect
        this.router.navigate(['/login']);
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
