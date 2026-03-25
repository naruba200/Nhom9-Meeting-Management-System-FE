import { Component, HostListener, OnDestroy, OnInit, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-user-menu',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css'
})
export class UserMenuComponent implements OnInit, OnDestroy {
  readonly fullName = input<string>('');
  readonly email = input<string>('');
  protected readonly isOpen = signal(false);
  protected unreadCount = 0;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    public readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const unreadStateSub = this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });
    this.subscriptions.push(unreadStateSub);

    this.loadUnreadCount();

    const refreshSub = interval(30000).subscribe(() => {
      this.loadUnreadCount();
    });
    this.subscriptions.push(refreshSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  protected toggleMenu(): void {
    this.isOpen.update((value) => !value);
  }

  protected closeMenu(): void {
    this.isOpen.set(false);
  }

  protected logout(): void {
    this.closeMenu();
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

  private loadUnreadCount(): void {
    const unreadSub = this.notificationService.getUnreadCount().subscribe({
      next: () => {},
      error: () => {
        this.unreadCount = 0;
      }
    });
    this.subscriptions.push(unreadSub);
  }

  protected getInitials(): string {
    const name = this.fullName().trim();
    if (!name) {
      return 'U';
    }

    const parts = name.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  protected getUnreadCountLabel(): string {
    return this.unreadCount > 99 ? '99+' : String(this.unreadCount);
  }

  @HostListener('document:click')
  protected handleDocumentClick(): void {
    this.closeMenu();
  }
}