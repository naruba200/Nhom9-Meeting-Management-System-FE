import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy, OnInit, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeetingMinutesService } from '../../../services/minutes.service';
import { TaskService } from '../../../services/task.service';
import { MeetingService } from '../../../services/meeting.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { MeetingMinutes, CreateMeetingMinutesRequest, SignMeetingMinutesRequest } from '../../../models/minutes.models';
import { Meeting } from '../../../models/meeting.models';
import { Task } from '../../../models/task.models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-minutes-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './minutes-editor.component.html',
  styleUrls: ['./minutes-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MinutesEditorComponent implements OnInit, OnDestroy {
  private readonly minutesService = inject(MeetingMinutesService);
  private readonly taskService = inject(TaskService);
  private readonly meetingService = inject(MeetingService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  readonly meetingId = input.required<number>();
  readonly cancelEdit = output<void>();
  readonly minutes = signal<MeetingMinutes | null>(null);
  readonly meeting = signal<Meeting | null>(null);
  readonly tasks = signal<Task[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);
  readonly showSignModal = signal(false);
  readonly currentUserEmail = signal('');
  readonly canManage = computed(() => {
    const meeting = this.meeting();
    const userEmail = this.currentUserEmail();
    return meeting?.organizerEmail === userEmail;
  });
  readonly hasCurrentUserSigned = computed(() => {
    const userEmail = this.currentUserEmail().trim().toLowerCase();
    if (!userEmail || !this.minutes()) {
      return false;
    }

    return this.minutes()!.signatures.some(signature =>
      (signature.signerEmail || '').trim().toLowerCase() === userEmail && !!signature.signedAt
    );
  });

  readonly minutesForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    minutesCreatedAt: ['', [Validators.required]],
    minutesClosedAt: ['', [Validators.required]],
    purpose: ['', [Validators.maxLength(2000)]],
    attendees: ['', [Validators.maxLength(2000)]],
    absentees: ['', [Validators.maxLength(2000)]],
    content: ['', [Validators.maxLength(10000)]],
    decisions: ['', [Validators.maxLength(5000)]],
    contributions: ['', [Validators.maxLength(5000)]],
    voting: ['', [Validators.maxLength(2000)]],
    conclusions: ['', [Validators.maxLength(5000)]],
    selectedTaskIds: [[]]
  });

  readonly signForm: FormGroup = this.fb.group({
    signerName: [''],
    agreed: [false, [Validators.requiredTrue]],
    notes: ['']
  });

  ngOnInit() {
    this.currentUserEmail.set(this.authService.getUserInfo()?.email || '');
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.isLoading.set(true);

    this.taskService.loadTasksByMeeting(this.meetingId()).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });

    this.minutesService.getMinutesByMeeting(this.meetingId()).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (minutes) => {
        if (!minutes) {
          this.isEditMode.set(false);
          this.isLoading.set(false);
          return;
        }
        this.minutes.set(minutes);
        this.isEditMode.set(true);
        this.populateForm(minutes);
        this.isLoading.set(false);
      },
      error: (error) => {
        // Minutes don't exist yet, that's okay
        this.isEditMode.set(false);
        this.isLoading.set(false);
      }
    });

    this.meetingService.getMeetingById(this.meetingId()).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (meeting) => {
        this.meeting.set(meeting);
        // Auto-fill time fields from meeting data
        if (meeting.startTime && meeting.endTime) {
          this.minutesForm.patchValue({
            minutesCreatedAt: meeting.startTime.substring(0, 16),
            minutesClosedAt: meeting.endTime.substring(0, 16)
          });
        }
      },
      error: (error) => {
        console.error('Error loading meeting:', error);
      }
    });
  }

  private populateForm(minutes: MeetingMinutes) {
    this.minutesForm.patchValue({
      title: minutes.title,
      minutesCreatedAt: minutes.minutesCreatedAt.substring(0, 16),
      minutesClosedAt: minutes.minutesClosedAt.substring(0, 16),
      purpose: minutes.purpose,
      attendees: minutes.attendees,
      absentees: minutes.absentees,
      content: minutes.content,
      decisions: minutes.decisions,
      contributions: minutes.contributions,
      voting: minutes.voting,
      conclusions: minutes.conclusions,
      selectedTaskIds: minutes.tasks.map(t => t.taskId)
    });
  }

  submitMinutes() {
    if (!this.canManage()) {
      this.toastService.error('Chỉ người tổ chức cuộc họp mới được tạo/sửa biên bản');
      return;
    }

    if (this.minutesForm.invalid) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    this.isSaving.set(true);
    const formValue = this.minutesForm.value;
    const normalizedTitle = (formValue.title ?? '').trim();
    if (!normalizedTitle) {
      this.toastService.error('Tiêu đề biên bản không được để trống');
      this.isSaving.set(false);
      return;
    }

    const request: CreateMeetingMinutesRequest = {
      title: normalizedTitle,
      minutesCreatedAt: this.toLocalDateTimeString(formValue.minutesCreatedAt),
      minutesClosedAt: this.toLocalDateTimeString(formValue.minutesClosedAt),
      purpose: formValue.purpose,
      attendees: formValue.attendees,
      absentees: formValue.absentees,
      content: formValue.content,
      decisions: formValue.decisions,
      contributions: formValue.contributions,
      voting: formValue.voting,
      conclusions: formValue.conclusions,
      taskIds: formValue.selectedTaskIds
    };

    if (this.isEditMode()) {
      const minutes = this.minutes();
      if (!minutes) return;

      this.minutesService.updateMinutes(minutes.id!, request as any).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (updated) => {
          this.minutes.set(updated);
          this.toastService.success('Minutes updated successfully');
          this.isSaving.set(false);
        },
        error: (error) => {
          this.toastService.error(this.extractErrorMessage(error, 'Failed to update minutes'));
          console.error(error);
          this.isSaving.set(false);
        }
      });
    } else {
      this.minutesService.createMinutes(this.meetingId(), request).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (created) => {
          this.minutes.set(created);
          this.isEditMode.set(true);
          this.toastService.success('Minutes created successfully');
          this.isSaving.set(false);
        },
        error: (error) => {
          this.toastService.error(this.extractErrorMessage(error, 'Failed to create minutes'));
          console.error(error);
          this.isSaving.set(false);
        }
      });
    }
  }

  private toLocalDateTimeString(value: string): string {
    // datetime-local gives yyyy-MM-ddTHH:mm, backend LocalDateTime parses reliably with seconds.
    return value?.length === 16 ? `${value}:00` : value;
  }

  private extractErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || fallback;
  }

  openSignModal() {
    this.signForm.patchValue({
      signerName: this.authService.getUserInfo()?.fullName || '',
      agreed: false,
      notes: ''
    });
    this.showSignModal.set(true);
  }

  closeSignModal() {
    this.showSignModal.set(false);
    this.signForm.reset();
  }

  closeEditor() {
    this.cancelEdit.emit();
  }

  submitSignature() {
    if (this.signForm.invalid) {
      this.toastService.error('Please accept the minutes to sign');
      return;
    }

    const signerEmail = this.currentUserEmail();
    if (!signerEmail) {
      this.toastService.error('Không tìm thấy email người dùng hiện tại. Vui lòng đăng nhập lại');
      return;
    }

    const minutes = this.minutes();
    if (!minutes) return;

    const request: SignMeetingMinutesRequest = {
      signerEmail,
      signerName: this.signForm.value.signerName,
      agreed: this.signForm.value.agreed,
      notes: this.signForm.value.notes
    };

    this.minutesService.signMinutes(minutes.id!, request).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // Sau khi ký thành công, gọi lại API lấy biên bản mới nhất để cập nhật signatures
        this.minutesService.getMinutesByMeeting(this.meetingId()).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (updatedMinutes) => {
            if (updatedMinutes) {
              this.minutes.set(updatedMinutes);
            }
            this.toastService.success('Signature submitted successfully');
            this.closeSignModal();
          },
          error: (error) => {
            this.toastService.error('Đã ký nhưng không thể cập nhật biên bản mới');
            this.closeSignModal();
          }
        });
      },
      error: (error) => {
        this.toastService.error(this.extractErrorMessage(error, 'Failed to sign minutes'));
        console.error(error);
      }
    });
  }

  finalizeMinutes() {
    const minutes = this.minutes();
    if (!minutes) return;

    if (!confirm('Are you sure you want to finalize these minutes? This cannot be undone.')) {
      return;
    }

    this.isSaving.set(true);
    this.minutesService.finalizeMinutes(minutes.id!).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.toastService.success('Minutes finalized successfully');
        this.isSaving.set(false);
        this.loadData();
      },
      error: (error) => {
        this.toastService.error('Failed to finalize minutes');
        console.error(error);
        this.isSaving.set(false);
      }
    });
  }

  deleteMinutes() {
    const minutes = this.minutes();
    if (!minutes) return;

    if (!confirm('Are you sure you want to delete these minutes? This cannot be undone.')) {
      return;
    }

    this.isSaving.set(true);
    this.minutesService.deleteMinutes(minutes.id!).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.toastService.success('Minutes deleted successfully');
        this.minutes.set(null);
        this.isEditMode.set(false);
        this.minutesForm.reset();
      },
      error: (error) => {
        this.toastService.error('Failed to delete minutes');
        console.error(error);
        this.isSaving.set(false);
      }
    });
  }

  isTaskSelected(taskId: number | undefined): boolean {
    if (taskId == null) {
      return false;
    }
    const selected = (this.minutesForm.get('selectedTaskIds')?.value as number[] | null) ?? [];
    return selected.includes(taskId);
  }

  onTaskSelectionChange(taskId: number | undefined, checked: boolean): void {
    if (taskId == null) {
      return;
    }

    const control = this.minutesForm.get('selectedTaskIds');
    const current = ([...(control?.value || [])] as number[]);

    if (checked && !current.includes(taskId)) {
      control?.setValue([...current, taskId]);
      return;
    }

    if (!checked) {
      control?.setValue(current.filter((id) => id !== taskId));
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DRAFT':
        return '#6B7280';
      case 'FINALIZED':
        return '#F59E0B';
      case 'SIGNED':
        return '#10B981';
      default:
        return '#6B7280';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'Draft';
      case 'FINALIZED':
        return 'Finalized';
      case 'SIGNED':
        return 'Signed';
      default:
        return status;
    }
  }
}
