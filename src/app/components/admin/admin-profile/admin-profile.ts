import { ChangeDetectorRef, Component, NgZone, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { timeout, TimeoutError, Subscription, finalize } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UserProfile, UpdateProfileRequest, GoogleLinkStatusResponse } from '../../../models/auth.models';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.css']
})
export class AdminProfile implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  userInfo: { email: string; fullName: string } | null = null;

  userProfile: UserProfile | null = null;
  isLoading: boolean = true;
  isEditing: boolean = false;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Google account linking
  googleStatus: GoogleLinkStatusResponse | null = null;
  loadingGoogleStatus = false;
  linkingGoogle = false;
  private popupWindow: Window | null = null;
  private readonly subscriptions: Subscription[] = [];

  // Edit form data
  editForm: UpdateProfileRequest = {
    fullName: '',
    phone: ''
  };

  private readonly onMessageHandler = (event: MessageEvent) => {
    const data = event.data as { type?: string; success?: boolean; message?: string };
    if (data?.type !== 'google-link-result') {
      return;
    }

    this.ngZone.run(() => {
      this.linkingGoogle = false;
      if (data.success) {
        this.successMessage = 'Liên kết Google thành công.';
      } else {
        this.errorMessage = data.message || 'Liên kết Google thất bại.';
      }
      this.loadGoogleStatus();
      this.cdr.detectChanges();
    });
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[AdminProfile] Bỏ qua loadProfile khi đang render phía server');
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    window.addEventListener('message', this.onMessageHandler);
    this.loadGoogleStatus();

    if (!this.authService.getToken()) {
      console.error('[AdminProfile] Không tìm thấy token trước khi tải profile');
      this.errorMessage = 'Bạn chưa đăng nhập hoặc phiên đăng nhập không còn hợp lệ.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadProfile();
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.onMessageHandler);
    this.popupWindow?.close();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('[AdminProfile] Bắt đầu tải thông tin cá nhân');

    this.authService.getProfile().pipe(timeout(10000)).subscribe({
      next: (profile) => {
        console.log('[AdminProfile] Tải thông tin cá nhân thành công');
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
          console.error('[AdminProfile] Lỗi: Máy chủ không phản hồi sau 10 giây (TimeoutError)');
          this.errorMessage = 'Máy chủ không phản hồi. Vui lòng kiểm tra kết nối và thử lại.';
        } else {
          console.error(`[AdminProfile] Lỗi ${error.status ?? 'unknown'} khi tải profile:`, error.message ?? error);
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

  loadGoogleStatus(): void {
    this.loadingGoogleStatus = true;
    const sub = this.authService.getGoogleLinkStatus()
      .pipe(finalize(() => {
        this.loadingGoogleStatus = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (status) => {
          this.googleStatus = status;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Không lấy được trạng thái liên kết Google.';
          this.cdr.detectChanges();
        },
      });

    this.subscriptions.push(sub);
  }

  connectGoogle(): void {
    this.linkingGoogle = true;
    this.errorMessage = '';
    this.successMessage = '';

    const sub = this.authService.getGoogleLinkUrl()
      .pipe(finalize(() => {
        if (!this.popupWindow || this.popupWindow.closed) {
          this.linkingGoogle = false;
          this.cdr.detectChanges();
        }
      }))
      .subscribe({
        next: (response) => {
          this.popupWindow = window.open(response.authorizationUrl, 'google_oauth_link', 'width=540,height=680');
          if (!this.popupWindow) {
            this.errorMessage = 'Trình duyệt đã chặn popup. Vui lòng cho phép popup và thử lại.';
            this.linkingGoogle = false;
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Không thể bắt đầu liên kết Google.';
          this.linkingGoogle = false;
          this.cdr.detectChanges();
        },
      });

    this.subscriptions.push(sub);
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
    this.authService.logout();
    this.router.navigate(['/login']);
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