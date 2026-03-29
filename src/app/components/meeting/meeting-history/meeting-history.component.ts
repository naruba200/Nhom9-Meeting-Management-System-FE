import { ChangeDetectorRef, Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, timeout, TimeoutError } from 'rxjs';
import { Meeting, MeetingStatus, isMeetingPendingHistory, getHoursUntilHistory } from '../../../models/meeting.models';
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
  totalPages = 0;
  totalElements = 0;
  isFirstPage = true;
  isLastPage = true;

  // Store total counts for stats display (independent of pagination/filtering)
  totalCompletedCount = 0;
  totalCancelledCount = 0;

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

    this.loadHistoryMeetings();
  }

  loadHistoryMeetings(): void {
    this.loading = true;
    this.errorMessage = '';

    // Load all history meetings at once (client-side pagination)
    const loadSub = this.meetingService.getHistoryMeetingsPaginated(0, 10000, this.sortOrder)
      .pipe(timeout(10000))
      .subscribe({
        next: (response) => {
          this.meetings = response.content;
          
          // Calculate total counts from all loaded meetings
          this.totalCompletedCount = this.meetings.filter(m => m.status === 'completed').length;
          this.totalCancelledCount = this.meetings.filter(m => m.status === 'cancelled').length;
          this.totalElements = this.meetings.length;
          
          this.loading = false;
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

  get filteredHistoryMeetings(): Meeting[] {
    // Filter by search keyword and user participation only (status already filtered by API)
    const filtered = this.meetings.filter((meeting) => {
      // Check if meeting is in history (user is organizer or accepted participant)
      const isOrganizer = meeting.organizerEmail === this.accountEmail;
      const isAcceptedParticipant = meeting.participants.some(
        p => p.email === this.accountEmail && p.status === 'accepted'
      );

      const isInHistory = isOrganizer || isAcceptedParticipant;
      if (!isInHistory) {
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
    return this.filteredHistoryMeetings.slice(start, end);
  }

  get totalHistoryMeetings(): number {
    return this.filteredHistoryMeetings.length;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadHistoryMeetings();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
  }

  onSearch(): void {
    this.currentPage = 1;
  }

  get totalCompleted(): number {
    return this.totalCompletedCount;
  }

  get totalCancelled(): number {
    return this.totalCancelledCount;
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

  /**
   * Kiểm tra xem cuộc họp có sắp chuyển sang lịch sử không (trong vòng 24h sau khi kết thúc)
   */
  isMeetingPendingHistory(meeting: Meeting): boolean {
    return isMeetingPendingHistory(meeting);
  }

  /**
   * Lấy thông báo countdown cho cuộc họp sắp chuyển lịch sử
   */
  getHistoryCountdownMessage(meeting: Meeting): string {
    const now = new Date();
    const end = new Date(meeting.endTime);
    const historyThreshold = new Date(end.getTime() + 24 * 60 * 60 * 1000);

    if (now >= historyThreshold) {
      return 'Đã chuyển sang lịch sử';
    }

    const diffMs = historyThreshold.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `Sẽ chuyển sang lịch sử sau ${hours} giờ ${minutes} phút`;
    } else {
      return `Sẽ chuyển sang lịch sử sau ${minutes} phút`;
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

    // Helper function to add centered text
    const addCenteredText = (text: string, fontSize: number, fontWeight: 'bold' | 'normal', yPos: number) => {
      doc.setFont('helvetica', fontWeight);
      doc.setFontSize(fontSize);
      doc.text(text, pageWidth / 2, yPos, { align: 'center' });
    };

    // Title - CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
    addCenteredText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 12, 'bold', y + 5);
    y += 7;
    addCenteredText('Độc lập - Tự do - Hạnh phúc', 12, 'normal', y + 5);
    y += 15;

    // Title - BIÊN BẢN CUỘC HỌP
    addCenteredText('BIÊN BẢN CUỘC HỌP', 16, 'bold', y + 5);
    y += 12;

    // Meeting title
    addCenteredText(minutes.title || '', 14, 'bold', y + 5);
    y += 15;

    // Time
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. Thời gian:', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const timeValue = `${this.formatDateTime(minutes.minutesCreatedAt)} - ${this.formatDateTime(minutes.minutesClosedAt)}`;
    doc.text(timeValue, margin + 5, y);
    y += 10;

    // Location
    if (minutes.location) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('2. Địa điểm:', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const locationLines = doc.splitTextToSize(minutes.location, contentWidth - 5);
      doc.text(locationLines, margin + 5, y);
      y += locationLines.length * 6 + 4;
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('2. Địa điểm:', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Không có', margin + 5, y);
      y += 10;
    }

    // Purpose
    if (minutes.purpose) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('3. Mục đích:', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const purposeLines = doc.splitTextToSize(minutes.purpose, contentWidth - 5);
      doc.text(purposeLines, margin + 5, y);
      y += purposeLines.length * 6 + 4;
    }

    // Attendees
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('4. Thành phần tham dự:', margin, y);
    y += 7;
    if (minutes.attendees) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const attendeeLines = doc.splitTextToSize(minutes.attendees, contentWidth - 5);
      doc.text(attendeeLines, margin + 5, y);
      y += attendeeLines.length * 6 + 4;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Không có', margin + 5, y);
      y += 10;
    }

    // Absentees
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('5. Vắng mặt:', margin, y);
    y += 7;
    if (minutes.absentees) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const absenteeLines = doc.splitTextToSize(minutes.absentees, contentWidth - 5);
      doc.text(absenteeLines, margin + 5, y);
      y += absenteeLines.length * 6 + 4;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Không có', margin + 5, y);
      y += 10;
    }

    // Content
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('6. Nội dung cuộc họp:', margin, y);
    y += 7;
    if (minutes.content) {
      if (y > 240) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const contentLines = doc.splitTextToSize(minutes.content, contentWidth - 5);
      doc.text(contentLines, margin + 5, y);
      y += contentLines.length * 6 + 4;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Không có', margin + 5, y);
      y += 10;
    }

    // Decisions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('7. Quyết định, chỉ thị:', margin, y);
    y += 7;
    if (minutes.decisions) {
      if (y > 240) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const decisionsLines = doc.splitTextToSize(minutes.decisions, contentWidth - 5);
      doc.text(decisionsLines, margin + 5, y);
      y += decisionsLines.length * 6 + 4;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Không có', margin + 5, y);
      y += 10;
    }

    // Contributions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('8. Ý kiến đóng góp:', margin, y);
    y += 7;
    if (minutes.contributions) {
      if (y > 240) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const contributionsLines = doc.splitTextToSize(minutes.contributions, contentWidth - 5);
      doc.text(contributionsLines, margin + 5, y);
      y += contributionsLines.length * 6 + 4;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Không có', margin + 5, y);
      y += 10;
    }

    // Voting
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('9. Biểu quyết:', margin, y);
    y += 7;
    if (minutes.voting) {
      if (y > 240) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const votingLines = doc.splitTextToSize(minutes.voting, contentWidth - 5);
      doc.text(votingLines, margin + 5, y);
      y += votingLines.length * 6 + 4;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Không có', margin + 5, y);
      y += 10;
    }

    // Conclusions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('10. Kết luận:', margin, y);
    y += 7;
    if (minutes.conclusions) {
      if (y > 240) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const conclusionsLines = doc.splitTextToSize(minutes.conclusions, contentWidth - 5);
      doc.text(conclusionsLines, margin + 5, y);
      y += conclusionsLines.length * 6 + 4;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Không có', margin + 5, y);
      y += 10;
    }

    // Signatures
    if (minutes.signatures && minutes.signatures.length > 0) {
      if (y > 200) { doc.addPage(); y = margin; }
      y += 10;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('CHỮ KÝ', pageWidth / 2, y, { align: 'center' });
      y += 10;

      const sigPerRow = 2;
      const sigWidth = (contentWidth - 10) / sigPerRow;

      minutes.signatures.forEach((sig, index) => {
        const row = Math.floor(index / sigPerRow);
        const col = index % sigPerRow;
        const sigX = margin + col * (sigWidth + 10);
        const sigY = y + row * 45;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(sig.signerName || sig.signerEmail, sigX, sigY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(sig.agreed ? 'Đã ký (Đồng ý)' : 'Đã ký (Không đồng ý)', sigX, sigY + 6);
        if (sig.signedAt) {
          doc.text(`Lúc: ${new Date(sig.signedAt).toLocaleString('vi-VN')}`, sigX, sigY + 12);
        }
        if (sig.notes) {
          const notesLines = doc.splitTextToSize(sig.notes, sigWidth);
          doc.text(notesLines, sigX, sigY + 18);
        }
      });
    }

    // Save PDF
    doc.save(`BienBan_${minutes.title}.pdf`);
    this.toastService.success('Đã tải biên bản PDF thành công!');
  }
}
