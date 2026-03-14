import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MeetingService } from '../../../services/meeting.service';

@Component({
  selector: 'app-create-meeting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.css']
})
export class CreateMeetingComponent {
  meetingForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  participantEmail = '';

  constructor(
    private fb: FormBuilder,
    private meetingService: MeetingService
  ) {
    this.meetingForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      participantEmails: this.fb.array([], Validators.minLength(1))
    });
  }

  get participantEmails(): FormArray {
    return this.meetingForm.get('participantEmails') as FormArray;
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

  addParticipant(email: string): void {
    const trimmedEmail = email.trim();
    if (trimmedEmail && this.isValidEmail(trimmedEmail)) {
      // Check if email already exists
      const existingEmails = this.participantEmails.value as string[];
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
      if (this.participantEmails.length === 0) {
        this.errorMessage = 'Vui lòng thêm ít nhất một người tham gia';
      }
      return;
    }

    // Validate time
    const startTime = this.meetingForm.value.startTime;
    const endTime = this.meetingForm.value.endTime;
    if (startTime >= endTime) {
      this.errorMessage = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const formValue = this.meetingForm.value;
      this.meetingService.addMeeting({
        title: formValue.title,
        date: formValue.date,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        participantEmails: formValue.participantEmails
      });

      this.successMessage = 'Tạo cuộc họp thành công!';
      this.resetForm();

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      this.errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm(): void {
    this.meetingForm.reset();
    while (this.participantEmails.length) {
      this.participantEmails.removeAt(0);
    }
    this.participantEmail = '';
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
