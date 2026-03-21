import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { finalize, Subscription, timeout, TimeoutError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AgendaItem, Meeting, ParticipantInvitationStatus, UpdateMeetingRequest } from '../../../models/meeting.models';
import { MeetingService } from '../../../services/meeting.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meeting-list.component.html',
  styleUrls: ['./meeting-list.component.css']
})
export class MeetingListComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  meetings: Meeting[] = [];
  currentUserEmail: string = '';
  selectedMeeting: Meeting | null = null;
  showDetailModal: boolean = false;
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmActionLabel = '';
  confirmActionStyle: 'danger' | 'warning' = 'warning';
  confirmActionType: 'cancelMeeting' | 'removeParticipant' | null = null;
  confirmMeetingTarget: Meeting | null = null;
  confirmParticipantEmail = '';
  showEditModal = false;
  showAgendaEditorModal = false;
  agendaEditorOpenedFromCard = false;
  isUpdatingMeeting = false;
  isSavingAgenda = false;
  isRemovingParticipant = false;
  removingParticipantEmail = '';
  agendaValidationAttempted = false;
  initialAgendaSnapshot = '[]';
  editErrorMessage = '';
  participantActionError = '';
  // Invite modal state
  showInviteModal = false;
  isInviting = false;
  inviteErrorMessage = '';
  inviteSuccessMessage = '';
  inviteMeetingId: number | null = null;
  inviteEmailInput = '';
  inviteEmails: string[] = [];
  inviteEmailError = '';
  existingParticipantEmails: string[] = [];
  editAgendaDragIndex: number | null = null;
  editForm: UpdateMeetingRequest & { id: number | null } = {
    id: null,
    title: '',
    agenda: '',
    agendaItems: [],
    date: '',
    startTime: '',
    endTime: '',
    externalMeetingLink: '',
    syncWithGoogleCalendar: false,
  };
  errorMessage = '';
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.authService.getToken()) {
      this.errorMessage = 'Bạn chưa đăng nhập hoặc phiên đăng nhập không còn hợp lệ.';
      this.cdr.detectChanges();
      return;
    }

    const meetingsSub = this.meetingService.getMeetings().subscribe(meetings => {
      this.meetings = meetings;

      if (this.selectedMeeting) {
        const refreshed = meetings.find((meeting) => meeting.id === this.selectedMeeting?.id);
        this.selectedMeeting = refreshed ?? null;
        if (!refreshed) {
          this.showDetailModal = false;
        }
      }

      this.cdr.detectChanges();
    });
    this.subscriptions.push(meetingsSub);

    const loadSub = this.meetingService.loadMeetings().pipe(timeout(10000)).subscribe({
      next: () => {
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        if (error instanceof TimeoutError) {
          this.errorMessage = 'Máy chủ không phản hồi khi tải cuộc họp. Vui lòng thử lại.';
        } else {
          this.errorMessage = 'Không thể tải dữ liệu cuộc họp. Vui lòng thử lại.';
        }
        console.error('Load meetings failed', error);
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(loadSub);
    
    const userInfo = this.authService.getUserInfo();
    this.currentUserEmail = userInfo?.email || '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getAvatarColor(index: number): string {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    return colors[index % colors.length];
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatDate(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  onInvite(meeting: Meeting): void {
    this.inviteMeetingId = meeting.id;
    this.inviteEmails = [];
    this.inviteEmailInput = '';
    this.inviteEmailError = '';
    this.inviteErrorMessage = '';
    this.inviteSuccessMessage = '';
    this.isInviting = false;
    this.existingParticipantEmails = meeting.participants.map(p => p.email.toLowerCase());
    this.showInviteModal = true;
  }

  addInviteEmail(): void {
    const email = this.inviteEmailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.inviteEmailError = 'Email không hợp lệ.';
      return;
    }
    if (this.currentUserEmail && email === this.currentUserEmail.toLowerCase()) {
      this.inviteEmailError = 'Bạn không thể tự mời chính mình vào cuộc họp do bạn tạo.';
      return;
    }
    if (this.inviteEmails.includes(email)) {
      this.inviteEmailError = 'Email này đã được thêm.';
      return;
    }
    if (this.existingParticipantEmails.includes(email)) {
      this.inviteEmailError = 'Email này đã là người tham gia trong cuộc họp.';
      return;
    }
    this.inviteEmails.push(email);
    this.inviteEmailInput = '';
    this.inviteEmailError = '';
  }

  removeInviteEmail(email: string): void {
    this.inviteEmails = this.inviteEmails.filter(e => e !== email);
  }

  submitInvite(): void {
    if (this.isInviting || this.inviteMeetingId == null) return;
    if (this.inviteEmailInput.trim()) {
      this.addInviteEmail();
      if (this.inviteEmailError) return;
    }
    if (this.inviteEmails.length === 0) {
      this.inviteErrorMessage = 'Vui lòng thêm ít nhất một email để mời.';
      return;
    }

    const meetingId = this.inviteMeetingId;
    const invitedCount = this.inviteEmails.length;
    this.isInviting = true;
    this.inviteErrorMessage = '';
    this.inviteSuccessMessage = '';

    const inviteSub = this.meetingService
      .inviteAttendees(meetingId, { attendeeEmails: this.inviteEmails })
      .pipe(
        finalize(() => {
          this.isInviting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.inviteSuccessMessage = `Đã gửi lời mời đến ${invitedCount} người thành công!`;
          this.inviteEmails = [];
          this.inviteEmailInput = '';
          this.refreshMeetingsView();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.inviteErrorMessage = error?.error?.message || 'Không thể gửi lời mời. Vui lòng thử lại.';
          this.cdr.detectChanges();
        },
      });
    this.subscriptions.push(inviteSub);
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
    this.inviteMeetingId = null;
    this.inviteEmails = [];
    this.inviteEmailInput = '';
    this.inviteEmailError = '';
    this.inviteErrorMessage = '';
    this.inviteSuccessMessage = '';
    this.isInviting = false;
  }

  onInviteModalBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeInviteModal();
    }
  }

  onEdit(meeting: Meeting): void {
    this.openEditModal(meeting);
  }

  onManageAgenda(meeting: Meeting): void {
    this.openEditModal(meeting);
    this.openAgendaEditorModal(true);
  }

  onCancel(meeting: Meeting): void {
    this.showConfirmModal = true;
    this.confirmActionType = 'cancelMeeting';
    this.confirmMeetingTarget = meeting;
    this.confirmParticipantEmail = '';
    this.confirmTitle = 'Xác nhận hủy cuộc họp';
    this.confirmMessage = `Bạn có chắc muốn hủy cuộc họp "${meeting.title}"? Hành động này sẽ thông báo đến người tham gia.`;
    this.confirmActionLabel = 'Hủy cuộc họp';
    this.confirmActionStyle = 'danger';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'Đã lên lịch';
      case 'in_progress':
        return 'Đang diễn ra';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
    }
  }

  getParticipantStatusText(status: ParticipantInvitationStatus | undefined): string {
    switch (status) {
      case 'accepted':
        return 'Đã chấp nhận';
      case 'declined':
        return 'Đã từ chối';
      default:
        return 'Chờ phản hồi';
    }
  }

  getParticipantStatusClass(status: ParticipantInvitationStatus | undefined): string {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'declined':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  get activeMeetings(): Meeting[] {
    return this.meetings.filter((meeting) =>
      meeting.status === 'scheduled' || meeting.status === 'in_progress'
    );
  }

  isCreator(meeting: Meeting): boolean {
    return meeting.organizerEmail === this.currentUserEmail;
  }

  onView(meeting: Meeting): void {
    this.openDetailModal(meeting);
  }

  openDetailModal(meeting: Meeting): void {
    this.selectedMeeting = meeting;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedMeeting = null;
    this.isRemovingParticipant = false;
    this.removingParticipantEmail = '';
    this.participantActionError = '';
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmActionType = null;
    this.confirmMeetingTarget = null;
    this.confirmParticipantEmail = '';
    this.confirmTitle = '';
    this.confirmMessage = '';
    this.confirmActionLabel = '';
    this.confirmActionStyle = 'warning';
  }

  onConfirmModalBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeConfirmModal();
    }
  }

  confirmAction(): void {
    if (!this.confirmActionType || !this.confirmMeetingTarget) {
      this.closeConfirmModal();
      return;
    }

    const meeting = this.confirmMeetingTarget;
    const actionType = this.confirmActionType;
    const participantEmail = this.confirmParticipantEmail;
    this.closeConfirmModal();

    if (actionType === 'cancelMeeting') {
      this.executeCancelMeeting(meeting);
      return;
    }

    if (actionType === 'removeParticipant') {
      this.executeRemoveParticipant(meeting, participantEmail);
    }
  }

  private refreshMeetingsView(): void {
    const refreshSub = this.meetingService.loadMeetings().subscribe({
      next: () => {
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });

    this.subscriptions.push(refreshSub);
  }

  onModalBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeDetailModal();
    }
  }

  onRemoveParticipant(meeting: Meeting, participantEmail: string): void {
    if (this.isRemovingParticipant || !this.isCreator(meeting)) {
      return;
    }

    const normalizedEmail = participantEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      return;
    }

    this.showConfirmModal = true;
    this.confirmActionType = 'removeParticipant';
    this.confirmMeetingTarget = meeting;
    this.confirmParticipantEmail = normalizedEmail;
    this.confirmTitle = 'Xác nhận xóa người tham gia';
    this.confirmMessage = `Bạn có chắc muốn xóa người tham gia "${participantEmail}" khỏi cuộc họp này?`;
    this.confirmActionLabel = 'Xóa người tham gia';
    this.confirmActionStyle = 'warning';
  }

  private executeCancelMeeting(meeting: Meeting): void {
    const cancelSub = this.meetingService
      .cancelMeeting(meeting.id)
      .subscribe({
        next: () => {
          this.errorMessage = '';
          // Ensure active list updates immediately even before refresh completes.
          this.meetings = this.meetings.filter((item) => item.id !== meeting.id);
          this.closeDetailModal();
          this.refreshMeetingsView();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Không thể hủy cuộc họp. Vui lòng thử lại.';
          this.cdr.detectChanges();
        }
      });
    this.subscriptions.push(cancelSub);
  }

  private executeRemoveParticipant(meeting: Meeting, normalizedEmail: string): void {
    if (!normalizedEmail) {
      return;
    }

    this.isRemovingParticipant = true;
    this.removingParticipantEmail = normalizedEmail;
    this.participantActionError = '';

    const removeSub = this.meetingService
      .removeAttendee(meeting.id, normalizedEmail)
      .pipe(
        finalize(() => {
          this.isRemovingParticipant = false;
          this.removingParticipantEmail = '';
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (updatedMeeting) => {
          if (this.selectedMeeting && this.selectedMeeting.id === updatedMeeting.id) {
            this.selectedMeeting = updatedMeeting;
          }
          this.participantActionError = '';
          this.refreshMeetingsView();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.participantActionError = error?.error?.message || 'Không thể xóa người tham gia. Vui lòng thử lại.';
          this.cdr.detectChanges();
        },
      });

    this.subscriptions.push(removeSub);
  }

  onEditModalBackdropClick(event: MouseEvent): void {
    if (this.showAgendaEditorModal) {
      return;
    }

    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeEditModal();
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.showAgendaEditorModal = false;
    this.agendaEditorOpenedFromCard = false;
    this.isUpdatingMeeting = false;
    this.isSavingAgenda = false;
    this.agendaValidationAttempted = false;
    this.initialAgendaSnapshot = '[]';
    this.editAgendaDragIndex = null;
    this.editErrorMessage = '';
    this.editForm = {
      id: null,
      title: '',
      agenda: '',
      agendaItems: [],
      date: '',
      startTime: '',
      endTime: '',
      externalMeetingLink: '',
      syncWithGoogleCalendar: false,
    };
  }

  openAgendaEditorModal(openedFromCard: boolean = false): void {
    if (this.isSavingAgenda) {
      return;
    }

    this.agendaEditorOpenedFromCard = openedFromCard;
    this.showAgendaEditorModal = true;
    this.agendaValidationAttempted = false;
    this.editAgendaDragIndex = null;
  }

  closeAgendaEditorModal(): void {
    if (this.isSavingAgenda) {
      return;
    }

    this.closeAgendaEditorModalInternal();
  }

  private closeAgendaEditorModalInternal(): void {

    if (this.agendaEditorOpenedFromCard) {
      this.closeEditModal();
      return;
    }

    this.showAgendaEditorModal = false;
    this.editAgendaDragIndex = null;
  }

  onAgendaEditorBackdropClick(event: MouseEvent): void {
    if (this.isSavingAgenda) {
      return;
    }

    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeAgendaEditorModal();
    }
  }

  submitEditMeeting(): void {
    if (this.isUpdatingMeeting || this.editForm.id == null) {
      return;
    }

    if (!this.editForm.title.trim() || !this.editForm.date || !this.editForm.startTime || !this.editForm.endTime) {
      this.editErrorMessage = 'Vui lòng nhập đầy đủ tiêu đề, ngày và thời gian.';
      return;
    }

    const start = new Date(`${this.editForm.date}T${this.editForm.startTime}:00`);
    const end = new Date(`${this.editForm.date}T${this.editForm.endTime}:00`);
    if (end <= start) {
      this.editErrorMessage = 'Thời gian kết thúc phải sau thời gian bắt đầu.';
      return;
    }

    const agendaValidationError = this.validateAgendaItems(this.editForm.agendaItems || []);
    if (agendaValidationError) {
      this.editErrorMessage = agendaValidationError;
      return;
    }

    this.isUpdatingMeeting = true;
    this.editErrorMessage = '';
    this.normalizeEditAgendaOrders();

    const updateSub = this.meetingService.updateMeeting(this.editForm.id, {
      title: this.editForm.title,
      agenda: this.editForm.agenda,
      agendaItems: this.editForm.agendaItems,
      date: this.editForm.date,
      startTime: this.editForm.startTime,
      endTime: this.editForm.endTime,
      externalMeetingLink: this.editForm.externalMeetingLink,
      syncWithGoogleCalendar: this.editForm.syncWithGoogleCalendar,
    }).subscribe({
      next: () => {
        this.closeEditModal();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isUpdatingMeeting = false;
        this.editErrorMessage = error?.error?.message || 'Không thể cập nhật cuộc họp. Vui lòng thử lại.';
        this.cdr.detectChanges();
      },
    });

    this.subscriptions.push(updateSub);
  }

  private openEditModal(meeting: Meeting): void {
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);

    this.selectedMeeting = meeting;

    this.editForm = {
      id: meeting.id,
      title: meeting.title,
      agenda: meeting.agenda || '',
      agendaItems: (meeting.agendaItems || []).map((item, index) => ({
        id: item.id,
        title: item.title,
        durationMinutes: item.durationMinutes,
        description: item.description || '',
        itemOrder: index + 1,
      })),
      date: this.toDateInputValue(start),
      startTime: this.toTimeInputValue(start),
      endTime: this.toTimeInputValue(end),
      externalMeetingLink: meeting.meetingLink || '',
      syncWithGoogleCalendar: meeting.syncedWithGoogleCalendar,
    };

    this.editErrorMessage = '';
    this.agendaValidationAttempted = false;
    this.initialAgendaSnapshot = this.buildAgendaSnapshot(this.editForm.agendaItems || []);
    this.editAgendaDragIndex = null;
    this.showEditModal = true;
  }

  addEditAgendaItem(): void {
    this.editForm.agendaItems = [
      ...(this.editForm.agendaItems || []),
      {
        title: '',
        durationMinutes: 10,
        description: '',
        itemOrder: (this.editForm.agendaItems?.length || 0) + 1,
      },
    ];
    this.normalizeEditAgendaOrders();
  }

  removeEditAgendaItem(index: number): void {
    this.editForm.agendaItems = (this.editForm.agendaItems || []).filter((_, i) => i !== index);
    this.normalizeEditAgendaOrders();
  }

  onEditAgendaDragStart(index: number): void {
    this.editAgendaDragIndex = index;
  }

  onEditAgendaDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onEditAgendaDrop(dropIndex: number): void {
    if (this.editAgendaDragIndex == null || this.editAgendaDragIndex === dropIndex) {
      this.editAgendaDragIndex = null;
      return;
    }

    const items = [...(this.editForm.agendaItems || [])];
    const [dragged] = items.splice(this.editAgendaDragIndex, 1);
    const adjustedIndex = this.editAgendaDragIndex < dropIndex ? dropIndex - 1 : dropIndex;
    items.splice(adjustedIndex, 0, dragged);

    this.editForm.agendaItems = items;
    this.normalizeEditAgendaOrders();
    this.editAgendaDragIndex = null;
  }

  onEditAgendaDragEnd(): void {
    this.editAgendaDragIndex = null;
  }

  saveAgendaFromEditor(): void {
    if (this.isSavingAgenda || this.isUpdatingMeeting || this.editForm.id == null) {
      return;
    }

    if (!this.hasAgendaChanges()) {
      return;
    }

    this.agendaValidationAttempted = true;

    const agendaValidationError = this.validateAgendaItems(this.editForm.agendaItems || []);
    if (agendaValidationError) {
      this.editErrorMessage = agendaValidationError;
      return;
    }

    this.isSavingAgenda = true;
    this.editErrorMessage = '';
    this.normalizeEditAgendaOrders();

    const updateAgendaSub = this.meetingService
      .updateMeetingAgenda(this.editForm.id, this.editForm.agendaItems || [])
      .pipe(
        finalize(() => {
          this.isSavingAgenda = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.closeAgendaEditorModalInternal();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.editErrorMessage = error?.error?.message || 'Không thể lưu agenda. Vui lòng thử lại.';
          this.cdr.detectChanges();
        },
      });

    this.subscriptions.push(updateAgendaSub);
  }

  getEditAgendaTotalMinutes(): number {
    return (this.editForm.agendaItems || []).reduce((sum, item) => {
      const duration = Number(item.durationMinutes);
      return sum + (Number.isFinite(duration) ? duration : 0);
    }, 0);
  }

  hasAgendaChanges(): boolean {
    return this.buildAgendaSnapshot(this.editForm.agendaItems || []) !== this.initialAgendaSnapshot;
  }

  isAgendaSaveDisabled(): boolean {
    return this.isSavingAgenda || this.isUpdatingMeeting || this.editForm.id == null || !this.hasAgendaChanges();
  }

  isAgendaDurationInvalid(durationMinutes: number | undefined): boolean {
    const duration = Number(durationMinutes);
    return !Number.isInteger(duration) || duration <= 0;
  }

  getAgendaTotalMinutes(meeting: Meeting): number {
    if (meeting.totalAgendaDurationMinutes > 0) {
      return meeting.totalAgendaDurationMinutes;
    }

    return (meeting.agendaItems || []).reduce((sum, item) => sum + (item.durationMinutes || 0), 0);
  }

  private normalizeEditAgendaOrders(): void {
    this.editForm.agendaItems = (this.editForm.agendaItems || []).map((item, index) => ({
      ...item,
      itemOrder: index + 1,
    }));
  }

  private validateAgendaItems(items: AgendaItem[]): string | null {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const indexLabel = `Mục #${i + 1}`;
      const title = item.title?.trim() || '';
      const description = item.description?.trim() || '';
      const duration = Number(item.durationMinutes);

      if (!title) {
        return `${indexLabel}: Tiêu đề mục là bắt buộc.`;
      }

      if (title.length > 255) {
        return `${indexLabel}: Tiêu đề mục tối đa 255 ký tự.`;
      }

      if (!Number.isInteger(duration) || duration <= 0) {
        return `${indexLabel}: Thời lượng phải là số nguyên dương.`;
      }

      if (!description) {
        return `${indexLabel}: Mô tả chi tiết không được để trống.`;
      }

      if (description.length > 2000) {
        return `${indexLabel}: Mô tả chi tiết tối đa 2000 ký tự.`;
      }
    }

    return null;
  }

  private buildAgendaSnapshot(items: AgendaItem[]): string {
    const normalized = (items || []).map((item, index) => ({
      title: (item.title || '').trim(),
      durationMinutes: Number(item.durationMinutes),
      description: (item.description || '').trim(),
      itemOrder: index + 1,
    }));

    return JSON.stringify(normalized);
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toTimeInputValue(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
