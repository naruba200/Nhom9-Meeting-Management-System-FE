import { ChangeDetectorRef, Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, timeout, TimeoutError } from 'rxjs';
import { Meeting, MeetingStatus } from '../../../models/meeting.models';
import { MeetingService } from '../../../services/meeting.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-meeting-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './meeting-history.component.html',
  styleUrls: ['./meeting-history.component.css']
})
export class MeetingHistoryComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  meetings: Meeting[] = [];
  loading = true;
  errorMessage = '';
  searchKeyword = '';
  statusFilter: 'all' | 'completed' | 'cancelled' = 'all';

  accountEmail = '';
  accountFullName = '';
  accountRole = '';

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    if (!this.authService.getToken()) {
      this.errorMessage = 'Bạn chưa đăng nhập hoặc phiên đăng nhập không còn hợp lệ.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const userInfo = this.authService.getUserInfo();
    this.accountEmail = userInfo?.email || '';
    this.accountFullName = userInfo?.fullName || '';
    this.accountRole = this.authService.getRole() || 'USER';

    const meetingsSub = this.meetingService.getMeetings().subscribe((meetings) => {
      this.meetings = meetings;
      this.cdr.detectChanges();
    });
    this.subscriptions.push(meetingsSub);

    const loadSub = this.meetingService.loadMeetings().pipe(timeout(10000)).subscribe({
      next: () => {
        this.loading = false;
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        if (error instanceof TimeoutError) {
          this.errorMessage = 'Máy chủ không phản hồi khi tải lịch sử cuộc họp. Vui lòng thử lại.';
        } else {
          this.errorMessage = error?.error?.message || 'Không thể tải lịch sử cuộc họp.';
        }
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(loadSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  get historyMeetings(): Meeting[] {
    const statuses = ['completed', 'cancelled'];

    return this.meetings.filter((meeting) => {
      const inHistory = statuses.includes(meeting.status);
      if (!inHistory) {
        return false;
      }

      if (this.statusFilter !== 'all' && meeting.status !== this.statusFilter) {
        return false;
      }

      const keyword = this.searchKeyword.trim().toLowerCase();
      if (!keyword) {
        return true;
      }

      const searchData = [
        meeting.title,
        meeting.agenda || '',
        meeting.organizerEmail,
        String(meeting.id),
        ...meeting.participants.map((participant) => participant.email)
      ].join(' ').toLowerCase();

      return searchData.includes(keyword);
    });
  }

  get totalCompleted(): number {
    return this.meetings.filter((meeting) => meeting.status === 'completed').length;
  }

  get totalCancelled(): number {
    return this.meetings.filter((meeting) => meeting.status === 'cancelled').length;
  }

  getStatusText(status: MeetingStatus): string {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'in_progress':
        return 'Đang diễn ra';
      default:
        return 'Đã lên lịch';
    }
  }

  getStatusClass(status: MeetingStatus): string {
    switch (status) {
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  }

  formatDateTime(value: string): string {
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

  resetFilters(): void {
    this.searchKeyword = '';
    this.statusFilter = 'all';
  }
}
