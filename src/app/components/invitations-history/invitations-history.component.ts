import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { InvitationService } from '../../services/invitation.service';
import { InvitationItem } from '../../models/invitation.models';

@Component({
  selector: 'app-invitations-history',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, PaginationComponent, FormsModule],
  templateUrl: './invitations-history.component.html',
  styleUrl: './invitations-history.component.css'
})
export class InvitationsHistoryComponent implements OnInit {
  invitations: InvitationItem[] = [];
  loading = false;
  errorMessage = '';
  sortOrder: 'newest' | 'oldest' = 'newest';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  constructor(
    private invitationService: InvitationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  get sortedInvitations(): InvitationItem[] {
    return [...this.invitations].sort((a, b) => {
      const dateA = new Date(a.invitedAt).getTime();
      const dateB = new Date(b.invitedAt).getTime();
      return this.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }

  get paginatedInvitations(): InvitationItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.sortedInvitations.slice(start, end);
  }

  get totalInvitations(): number {
    return this.invitations.length;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  loadHistory(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.invitationService.getInvitationHistory().subscribe({
      next: (items) => {
        this.invitations = items;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Không thể tải lịch sử lời mời.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusText(status: InvitationItem['status']): string {
    switch (status) {
      case 'ACCEPTED':
        return 'Đã chấp nhận';
      case 'DECLINED':
        return 'Đã từ chối';
      default:
        return 'Đang chờ phản hồi';
    }
  }

  getStatusClass(status: InvitationItem['status']): string {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700';
      case 'DECLINED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
