import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, Subscription } from 'rxjs';
import { MeetingService } from '../../../services/meeting.service';
import { AuthService } from '../../../services/auth.service';
import { GoogleLinkStatusResponse } from '../../../models/auth.models';

@Component({
  selector: 'app-create-meeting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.css']
})
export class CreateMeetingComponent implements OnInit, OnDestroy {
  meetingForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  participantEmail = '';
  currentUserEmail = '';
  googleStatus: GoogleLinkStatusResponse | null = null;
  agendaDragIndex: number | null = null;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private meetingService: MeetingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.meetingForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      agenda: [''],
      agendaItems: this.fb.array([]),
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      participantEmails: this.fb.array([]),
      syncWithGoogleCalendar: [false, Validators.required],
      externalMeetingLink: ['', [Validators.maxLength(500)]],
      timezone: [Intl.DateTimeFormat().resolvedOptions().timeZone],
    });
  }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    this.currentUserEmail = userInfo?.email?.trim().toLowerCase() || '';

    const cachedStatus = this.authService.getCachedGoogleLinkStatus();
    if (cachedStatus) {
      this.applyGoogleStatus(cachedStatus);
    }

    const cacheSub = this.authService.googleLinkStatus.subscribe(status => {
      if (status !== null) {
        this.applyGoogleStatus(status);
      }
    });
    this.subscriptions.push(cacheSub);

    // Always refresh from backend to keep UI in sync after login/navigation
    this.loadGoogleStatus();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  get participantEmails(): FormArray {
    return this.meetingForm.get('participantEmails') as FormArray;
  }

  get agendaItems(): FormArray {
    return this.meetingForm.get('agendaItems') as FormArray;
  }

  get titleControl() {
    return this.meetingForm.get('title');
  }

  get dateControl() {
    return this.meetingForm.get('date');
  }

  get startTimeControl() {
    return this.meetingForm.get('startTime');
  }

  get endTimeControl() {
    return this.meetingForm.get('endTime');
  }

  get syncWithGoogleCalendarControl() {
    return this.meetingForm.get('syncWithGoogleCalendar');
  }

  get externalMeetingLinkControl() {
    return this.meetingForm.get('externalMeetingLink');
  }

  get timezoneControl() {
    return this.meetingForm.get('timezone');
  }

  get totalAgendaDurationMinutes(): number {
    return this.agendaItems.controls.reduce((total, control) => {
      const value = Number(control.get('durationMinutes')?.value);
      return total + (Number.isFinite(value) ? value : 0);
    }, 0);
  }

  get isGoogleLinked(): boolean {
    return !!this.googleStatus?.linked;
  }

  private applyGoogleStatus(status: GoogleLinkStatusResponse): void {
    this.googleStatus = status;
    this.updateSyncControlByGoogleLink(!!status.linked);
    this.cdr.detectChanges();
  }

  private updateSyncControlByGoogleLink(isLinked: boolean): void {
    const syncControl = this.syncWithGoogleCalendarControl;
    if (!syncControl) {
      return;
    }

    syncControl.setValue(isLinked, { emitEvent: false });
    if (isLinked) {
      syncControl.enable({ emitEvent: false });
    } else {
      syncControl.disable({ emitEvent: false });
    }
  }

  addParticipant(email: string): void {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail && this.isValidEmail(trimmedEmail)) {
      if (this.currentUserEmail && trimmedEmail === this.currentUserEmail) {
        this.errorMessage = 'Bạn không thể tự mời chính mình vào cuộc họp do bạn tạo';
        return;
      }

      // Check if email already exists
      const existingEmails = (this.participantEmails.value as string[]).map(e => e.toLowerCase());
      if (!existingEmails.includes(trimmedEmail)) {
        this.participantEmails.push(this.fb.control(trimmedEmail));
        this.participantEmail = '';
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Email đã được thêm';
      }
    } else {
      this.errorMessage = 'Vui lòng nhập email hợp lệ';
    }
  }

  addAgendaItem(): void {
    this.agendaItems.push(this.createAgendaItemGroup());
    this.normalizeAgendaItemOrders();
  }

  removeAgendaItem(index: number): void {
    this.agendaItems.removeAt(index);
    this.normalizeAgendaItemOrders();
  }

  onAgendaDragStart(index: number): void {
    this.agendaDragIndex = index;
  }

  onAgendaDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onAgendaDrop(dropIndex: number): void {
    if (this.agendaDragIndex == null || this.agendaDragIndex === dropIndex) {
      this.agendaDragIndex = null;
      return;
    }

    const draggedControl = this.agendaItems.at(this.agendaDragIndex);
    this.agendaItems.removeAt(this.agendaDragIndex);

    const adjustedIndex = this.agendaDragIndex < dropIndex ? dropIndex - 1 : dropIndex;
    this.agendaItems.insert(adjustedIndex, draggedControl);

    this.normalizeAgendaItemOrders();
    this.agendaDragIndex = null;
  }

  onAgendaDragEnd(): void {
    this.agendaDragIndex = null;
  }

  removeParticipant(index: number): void {
    this.participantEmails.removeAt(index);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onKeyPress(event: KeyboardEvent, email: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addParticipant(email);
    }
  }

  onSubmit(): void {
    if (this.meetingForm.invalid) {
      this.meetingForm.markAllAsTouched();
      return;
    }

    const formValue = this.meetingForm.value;
    const agendaValidationError = this.validateAgendaItems(formValue.agendaItems || []);
    if (agendaValidationError) {
      this.errorMessage = agendaValidationError;
      return;
    }

    const startDateTime = new Date(`${formValue.date}T${formValue.startTime}:00`);
    const endDateTime = new Date(`${formValue.date}T${formValue.endTime}:00`);
    if (endDateTime <= startDateTime) {
      this.errorMessage = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      return;
    }

    if (formValue.syncWithGoogleCalendar && !this.googleStatus?.linked) {
      this.errorMessage = 'Bạn cần liên kết Google trước khi tạo Google Meet tự động.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.meetingService.addMeeting({
      title: formValue.title,
      agenda: formValue.agenda || '',
      agendaItems: (formValue.agendaItems || []).map((item: any, index: number) => ({
        title: item.title,
        durationMinutes: Number(item.durationMinutes),
        description: item.description,
        itemOrder: index + 1,
      })),
      date: formValue.date,
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      participantEmails: formValue.participantEmails || [],
      syncWithGoogleCalendar: !!formValue.syncWithGoogleCalendar,
      externalMeetingLink: formValue.externalMeetingLink || '',
      timezone: formValue.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    .pipe(finalize(() => {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: () => {
        this.successMessage = formValue.syncWithGoogleCalendar
          ? 'Tạo cuộc họp thành công, đã đồng bộ Google Calendar và tạo link Google Meet!'
          : 'Tạo cuộc họp thành công với link họp trực tuyến!';
        this.resetForm();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (error: HttpErrorResponse) => {
        const backendMessage = this.extractErrorMessage(error);
        this.errorMessage = backendMessage || 'Có lỗi xảy ra. Vui lòng thử lại.';

        if (backendMessage.toLowerCase().includes('googleaccesstoken')) {
          this.applyGoogleStatus({ linked: false });
          this.authService.invalidateGoogleLinkStatus();
          this.errorMessage = 'Google token đã hết hạn hoặc không hợp lệ. Vui lòng liên kết lại trong phần Cài đặt.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error.error && typeof error.error === 'object' && typeof error.error.message === 'string') {
      return error.error.message;
    }

    if (error.message && error.message.trim()) {
      return error.message;
    }

    return '';
  }

  resetForm(): void {
    this.meetingForm.reset();
    this.updateSyncControlByGoogleLink(this.isGoogleLinked);
    this.timezoneControl?.setValue(Intl.DateTimeFormat().resolvedOptions().timeZone);
    while (this.participantEmails.length) {
      this.participantEmails.removeAt(0);
    }
    while (this.agendaItems.length) {
      this.agendaItems.removeAt(0);
    }
    this.agendaDragIndex = null;
    this.participantEmail = '';
  }

  private createAgendaItemGroup(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      durationMinutes: [10, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      itemOrder: [1],
    });
  }

  private validateAgendaItems(items: Array<{ title?: string; durationMinutes?: number; description?: string }>): string | null {
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

  private normalizeAgendaItemOrders(): void {
    this.agendaItems.controls.forEach((control, index) => {
      control.get('itemOrder')?.setValue(index + 1, { emitEvent: false });
    });
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadGoogleStatus(): void {
    const sub = this.authService.getGoogleLinkStatus().subscribe({
      next: (status) => {
        this.applyGoogleStatus(status);
      },
      error: () => {
        this.googleStatus = null;
        this.updateSyncControlByGoogleLink(false);
        this.cdr.detectChanges();
      },
    });
    this.subscriptions.push(sub);
  }
}
