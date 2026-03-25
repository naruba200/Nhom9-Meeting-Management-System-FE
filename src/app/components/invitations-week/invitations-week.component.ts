import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { InvitationService } from '../../services/invitation.service';
import { InvitationItem } from '../../models/invitation.models';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-invitations-week',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './invitations-week.component.html',
  styleUrl: './invitations-week.component.css'
})
export class InvitationsWeekComponent implements OnInit {
  invitations: InvitationItem[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  declineTargetId: number | null = null;
  declineReason = '';
  declineError = '';
  actionLoadingId: number | null = null;

  constructor(
    private invitationService: InvitationService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.invitationService.getWeeklyInvitations().subscribe({
      next: (items) => {
        this.invitations = items;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Không thể tải danh sách lời mời tuần này.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  accept(invitation: InvitationItem): void {
    if (this.actionLoadingId !== null) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.actionLoadingId = invitation.attendeeId;
    this.cdr.detectChanges();

    this.invitationService.acceptInvitation(invitation.attendeeId).subscribe({
      next: () => {
        this.successMessage = `Đã chấp nhận lời mời: ${invitation.meetingTitle}`;
        this.toastService.success(this.successMessage);
        this.actionLoadingId = null;
        this.cdr.detectChanges();
        this.loadInvitations();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Không thể chấp nhận lời mời.';
        this.toastService.error(this.errorMessage);
        this.actionLoadingId = null;
        this.cdr.detectChanges();
      },
    });
  }

  openDeclineForm(invitation: InvitationItem): void {
    this.declineTargetId = invitation.attendeeId;
    this.declineReason = '';
    this.declineError = '';
    this.successMessage = '';
  }

  cancelDeclineForm(): void {
    this.declineTargetId = null;
    this.declineReason = '';
    this.declineError = '';
  }

  submitDecline(invitation: InvitationItem): void {
    const reason = this.declineReason.trim();
    if (!reason) {
      this.declineError = 'Vui lòng nhập lý do từ chối.';
      this.cdr.detectChanges();
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.declineError = '';
    this.actionLoadingId = invitation.attendeeId;
    this.cdr.detectChanges();

    this.invitationService.declineInvitation(invitation.attendeeId, { reason }).subscribe({
      next: () => {
        this.successMessage = `Đã từ chối lời mời: ${invitation.meetingTitle}`;
        this.toastService.warning(this.successMessage);
        this.actionLoadingId = null;
        this.cancelDeclineForm();
        this.cdr.detectChanges();
        this.loadInvitations();
      },
      error: (error) => {
        this.declineError = error?.error?.message || 'Không thể từ chối lời mời.';
        this.toastService.error(this.declineError);
        this.actionLoadingId = null;
        this.cdr.detectChanges();
      },
    });
  }

  formatDateTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
