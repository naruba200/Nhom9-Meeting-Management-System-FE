import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { GoogleLinkStatusResponse } from '../../models/auth.models';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnDestroy {
  googleStatus: GoogleLinkStatusResponse | null = null;
  loadingStatus = false;
  linkingGoogle = false;
  feedbackMessage = '';

  private popupWindow: Window | null = null;
  private readonly subscriptions: Subscription[] = [];
  private readonly onMessageHandler = (event: MessageEvent) => {
    const data = event.data as { type?: string; success?: boolean; message?: string };
    if (data?.type !== 'google-link-result') {
      return;
    }

    this.ngZone.run(() => {
      this.linkingGoogle = false;
      if (data.success) {
        this.feedbackMessage = 'Liên kết Google thành công.';
      } else {
        this.feedbackMessage = data.message || 'Liên kết Google thất bại.';
      }
      this.loadGoogleStatus();
      this.cdr.markForCheck();
    });
  };

  constructor(
    private readonly authService: AuthService,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    window.addEventListener('message', this.onMessageHandler);
    this.loadGoogleStatus();
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.onMessageHandler);
    this.popupWindow?.close();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadGoogleStatus(): void {
    this.loadingStatus = true;
    const sub = this.authService.getGoogleLinkStatus()
      .pipe(finalize(() => {
        this.loadingStatus = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (status) => {
          this.googleStatus = status;
          this.cdr.markForCheck();
        },
        error: () => {
          this.feedbackMessage = 'Không lấy được trạng thái liên kết Google.';
          this.cdr.markForCheck();
        },
      });

    this.subscriptions.push(sub);
  }

  connectGoogle(): void {
    this.linkingGoogle = true;
    this.feedbackMessage = '';

    const sub = this.authService.getGoogleLinkUrl()
      .pipe(finalize(() => {
        if (!this.popupWindow || this.popupWindow.closed) {
          this.linkingGoogle = false;
          this.cdr.markForCheck();
        }
      }))
      .subscribe({
        next: (response) => {
          this.popupWindow = window.open(response.authorizationUrl, 'google_oauth_link', 'width=540,height=680');
          if (!this.popupWindow) {
            this.feedbackMessage = 'Trình duyệt đã chặn popup. Vui lòng cho phép popup và thử lại.';
            this.linkingGoogle = false;
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          this.feedbackMessage = error?.error?.message || 'Không thể bắt đầu liên kết Google.';
          this.linkingGoogle = false;
          this.cdr.markForCheck();
        },
      });

    this.subscriptions.push(sub);
  }
}