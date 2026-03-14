import { Component, HostListener, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-menu',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css'
})
export class UserMenuComponent {
  readonly fullName = input<string>('');
  readonly email = input<string>('');
  protected readonly isOpen = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  protected toggleMenu(): void {
    this.isOpen.update((value) => !value);
  }

  protected closeMenu(): void {
    this.isOpen.set(false);
  }

  protected logout(): void {
    this.closeMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
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

  @HostListener('document:click')
  protected handleDocumentClick(): void {
    this.closeMenu();
  }
}