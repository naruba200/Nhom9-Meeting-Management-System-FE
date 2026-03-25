import { ChangeDetectorRef, Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, timeout, TimeoutError } from 'rxjs';
import { Meeting, MeetingStatus } from '../../../models/meeting.models';
import { MeetingService } from '../../../services/meeting.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { PaginationComponent } from '../../pagination/pagination.component';
import { MeetingMinutesService } from '../../../services/minutes.service';
import { MeetingMinutes } from '../../../models/minutes.models';
import { ToastService } from '../../../services/toast.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-meeting-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, PaginationComponent],
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
  sortOrder: 'newest' | 'oldest' = 'newest';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Minutes modal
  viewMinutes: MeetingMinutes | null = null;

  accountEmail = '';
  accountFullName = '';
  accountRole = '';

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private minutesService: MeetingMinutesService,
    private toastService: ToastService,
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

    const filtered = this.meetings.filter((meeting) => {
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

    // Sort
    return filtered.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return this.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }

  get paginatedHistoryMeetings(): Meeting[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.historyMeetings.slice(start, end);
  }

  get totalHistoryMeetings(): number {
    return this.historyMeetings.length;
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
    this.sortOrder = 'newest';
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  onViewMinutes(meeting: Meeting): void {
    if (!meeting.id) return;
    
    this.minutesService.getMinutesByMeeting(meeting.id).subscribe({
      next: (minutes) => {
        if (minutes) {
          this.viewMinutes = minutes;
          this.generateMinutesPdf(minutes);
        } else {
          this.toastService.warning('Cuộc họp này chưa có biên bản.');
        }
      },
      error: () => {
        this.toastService.error('Không thể tải biên bản cuộc họp.');
      }
    });
  }

  downloadMinutesPdf(meeting: Meeting): void {
    this.onViewMinutes(meeting);
  }

  generateMinutesPdf(minutes: MeetingMinutes): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let y = margin;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BIEN BAN CUOC HOP', pageWidth / 2, y + 10, { align: 'center' });
    y += 20;

    // Meeting title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(minutes.title, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Status
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const statusLabel = 'Trang thai: ';
    const statusValue = minutes.status === 'DRAFT' ? 'Nhap' : minutes.status === 'FINALIZED' ? 'Da hoan thanh' : 'Da ky';
    doc.text(statusLabel + statusValue, margin, y);
    y += 12;

    // Time
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const timeLabel = 'Thoi gian: ';
    const timeValue = `${this.formatDateTime(minutes.minutesCreatedAt)} - ${this.formatDateTime(minutes.minutesClosedAt)}`;
    doc.text(timeLabel + timeValue, margin, y);
    y += 12;

    // Location
    if (minutes.location) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const locationLabel = 'Dia diem: ';
      doc.text(locationLabel + minutes.location, margin, y);
      y += 12;
    }

    // Purpose
    if (minutes.purpose) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const purposeLabel = 'Muc dich: ';
      doc.text(purposeLabel + minutes.purpose, margin, y);
      y += 12;
    }

    y += 8;

    // Attendees
    if (minutes.attendees) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('THANH PHAN THAM DU', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const attendeeLines = doc.splitTextToSize(minutes.attendees, contentWidth);
      doc.text(attendeeLines, margin, y);
      y += attendeeLines.length * 6 + 6;
    }

    // Absentees
    if (minutes.absentees) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('VANG MAT', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const absenteeLines = doc.splitTextToSize(minutes.absentees, contentWidth);
      doc.text(absenteeLines, margin, y);
      y += absenteeLines.length * 6 + 6;
    }

    // Content
    if (minutes.content) {
      if (y > 240) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('NOI DUNG CUOC HOP', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const contentLines = doc.splitTextToSize(minutes.content, contentWidth);
      doc.text(contentLines, margin, y);
      y += contentLines.length * 6 + 6;
    }

    // Decisions
    if (minutes.decisions) {
      if (y > 240) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('QUYET DINH, CHI THI', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const decisionsLines = doc.splitTextToSize(minutes.decisions, contentWidth);
      doc.text(decisionsLines, margin, y);
      y += decisionsLines.length * 6 + 6;
    }

    // Contributions
    if (minutes.contributions) {
      if (y > 240) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Y KIEN DONG GOP', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const contributionsLines = doc.splitTextToSize(minutes.contributions, contentWidth);
      doc.text(contributionsLines, margin, y);
      y += contributionsLines.length * 6 + 6;
    }

    // Voting
    if (minutes.voting) {
      if (y > 240) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('BIEU QUET', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const votingLines = doc.splitTextToSize(minutes.voting, contentWidth);
      doc.text(votingLines, margin, y);
      y += votingLines.length * 6 + 6;
    }

    // Conclusions
    if (minutes.conclusions) {
      if (y > 240) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('KET LUAN', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const conclusionsLines = doc.splitTextToSize(minutes.conclusions, contentWidth);
      doc.text(conclusionsLines, margin, y);
      y += conclusionsLines.length * 6 + 6;
    }

    // Signatures
    if (minutes.signatures && minutes.signatures.length > 0) {
      if (y > 250) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('CHU KY', margin, y);
      y += 10;

      const sigPerRow = 2;
      const sigWidth = (contentWidth - 10) / sigPerRow;

      minutes.signatures.forEach((sig, index) => {
        const row = Math.floor(index / sigPerRow);
        const col = index % sigPerRow;
        const sigX = margin + col * (sigWidth + 10);
        const sigY = y + row * 40;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(sig.signerName || sig.signerEmail, sigX, sigY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(sig.agreed ? 'Da ky (Dong y)' : 'Da ky (Khong dong y)', sigX, sigY + 6);
        if (sig.signedAt) {
          doc.text(`Luc: ${new Date(sig.signedAt).toLocaleString('vi-VN')}`, sigX, sigY + 12);
        }
        if (sig.notes) {
          const notesLines = doc.splitTextToSize(sig.notes, sigWidth);
          doc.text(notesLines, sigX, sigY + 18);
        }
      });
    }

    // Save PDF
    doc.save(`BienBan_${minutes.title}.pdf`);
    this.toastService.success('Da tai bien ban PDF thanh cong!');
  }
}
