import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MeetingService, Participant } from '../../../services/meeting.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-create-meeting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-meeting-container">
      <div class="form-header">
        <h3>Tạo cuộc họp mới</h3>
        <p>Điền thông tin để lên lịch cuộc họp</p>
      </div>

      <form [formGroup]="meetingForm" (ngSubmit)="onSubmit()" class="meeting-form">
        <!-- Title -->
        <div class="form-group">
          <label for="title">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="label-icon">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Tiêu đề cuộc họp
          </label>
          <input 
            type="text" 
            id="title" 
            formControlName="title"
            placeholder="Nhập tiêu đề cuộc họp..."
            [class.error]="isFieldInvalid('title')"
          >
          <span class="error-message" *ngIf="isFieldInvalid('title')">
            Vui lòng nhập tiêu đề cuộc họp
          </span>
        </div>

        <!-- Date -->
        <div class="form-group">
          <label for="date">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="label-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Ngày họp
          </label>
          <input 
            type="date" 
            id="date" 
            formControlName="date"
            [class.error]="isFieldInvalid('date')"
          >
          <span class="error-message" *ngIf="isFieldInvalid('date')">
            Vui lòng chọn ngày họp
          </span>
        </div>

        <!-- Time Range -->
        <div class="form-row">
          <div class="form-group">
            <label for="startTime">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="label-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Bắt đầu
            </label>
            <input 
              type="time" 
              id="startTime" 
              formControlName="startTime"
              [class.error]="isFieldInvalid('startTime')"
            >
            <span class="error-message" *ngIf="isFieldInvalid('startTime')">
              Chọn giờ bắt đầu
            </span>
          </div>

          <div class="form-group">
            <label for="endTime">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="label-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Kết thúc
            </label>
            <input 
              type="time" 
              id="endTime" 
              formControlName="endTime"
              [class.error]="isFieldInvalid('endTime')"
            >
            <span class="error-message" *ngIf="isFieldInvalid('endTime')">
              Chọn giờ kết thúc
            </span>
          </div>
        </div>

        <!-- Participants -->
        <div class="form-group participants-group">
          <label>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="label-icon">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Người tham gia
          </label>
          
          <div class="participants-list" formArrayName="participants">
            <div 
              *ngFor="let participant of participantsArray.controls; let i = index"
              class="participant-input-row"
              [formGroupName]="i"
            >
              <input 
                type="email" 
                formControlName="email"
                placeholder="email@example.com"
                [class.error]="isParticipantInvalid(i)"
              >
              <button 
                type="button" 
                class="remove-btn"
                (click)="removeParticipant(i)"
                *ngIf="participantsArray.length > 1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <button type="button" class="add-participant-btn" (click)="addParticipant()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm người tham gia
          </button>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          class="submit-btn"
          [disabled]="meetingForm.invalid || isSubmitting"
        >
          <svg *ngIf="!isSubmitting" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <div *ngIf="isSubmitting" class="spinner"></div>
          {{ isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo' }}
        </button>

        <!-- Success Message -->
        <div class="success-message" *ngIf="showSuccess">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="success-icon">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Tạo cuộc họp thành công!
        </div>
      </form>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .create-meeting-container {
      background-color: #fff;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
      padding: 24px;
      font-family: 'Inter', 'Roboto', sans-serif;
    }

    .form-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f3f4f6;
    }

    .form-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 4px 0;
    }

    .form-header p {
      font-size: 13px;
      color: #6b7280;
      margin: 0;
    }

    .meeting-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    .label-icon {
      width: 16px;
      height: 16px;
      color: #9ca3af;
    }

    .form-group input {
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      font-size: 14px;
      color: #1f2937;
      background-color: #f9fafb;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .form-group input:focus {
      outline: none;
      border-color: #3b82f6;
      background-color: #fff;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group input::placeholder {
      color: #9ca3af;
    }

    .form-group input.error {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .form-group input.error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .error-message {
      font-size: 12px;
      color: #ef4444;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    /* Participants */
    .participants-group {
      gap: 12px;
    }

    .participants-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .participant-input-row {
      display: flex;
      gap: 8px;
    }

    .participant-input-row input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      font-size: 13px;
      color: #1f2937;
      background-color: #f9fafb;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .participant-input-row input:focus {
      outline: none;
      border-color: #3b82f6;
      background-color: #fff;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .remove-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fef2f2;
      border: none;
      border-radius: 10px;
      color: #ef4444;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .remove-btn:hover {
      background-color: #fee2e2;
    }

    .remove-btn .btn-icon {
      width: 16px;
      height: 16px;
    }

    .add-participant-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      background-color: #f3f4f6;
      border: 1px dashed #d1d5db;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .add-participant-btn:hover {
      background-color: #e5e7eb;
      border-color: #9ca3af;
      color: #374151;
    }

    .add-participant-btn .btn-icon {
      width: 16px;
      height: 16px;
    }

    /* Submit Button */
    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 24px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
      margin-top: 8px;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
    }

    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .submit-btn .btn-icon {
      width: 18px;
      height: 18px;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Success Message */
    .success-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      background-color: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      color: #059669;
      animation: slideIn 0.3s ease;
    }

    .success-icon {
      width: 18px;
      height: 18px;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .create-meeting-container {
        padding: 16px;
      }
    }
  `]
})
export class CreateMeetingComponent implements OnInit {
  meetingForm!: FormGroup;
  isSubmitting = false;
  showSuccess = false;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private meetingService: MeetingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.initForm();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.meetingForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      date: [today, Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['10:00', Validators.required],
      participants: this.fb.array([
        this.createParticipant()
      ])
    });
  }

  createParticipant(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get participantsArray(): FormArray {
    return this.meetingForm.get('participants') as FormArray;
  }

  addParticipant(): void {
    this.participantsArray.push(this.createParticipant());
  }

  removeParticipant(index: number): void {
    if (this.participantsArray.length > 1) {
      this.participantsArray.removeAt(index);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.meetingForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isParticipantInvalid(index: number): boolean {
    const participant = this.participantsArray.at(index);
    const emailControl = participant.get('email');
    return !!(emailControl && emailControl.invalid && (emailControl.dirty || emailControl.touched));
  }

  onSubmit(): void {
    if (this.meetingForm.valid) {
      this.isSubmitting = true;
      
      const formValue = this.meetingForm.value;
      const participants: Participant[] = formValue.participants.map((p: { email: string }) => ({
        email: p.email,
        name: p.email.split('@')[0],
        avatar: p.email.substring(0, 2).toUpperCase()
      }));

      const meeting = {
        title: formValue.title,
        date: formValue.date,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        participants,
        createdBy: this.currentUser?.email || ''
      };

      // Simulate API call delay
      setTimeout(() => {
        this.meetingService.addMeeting(meeting);
        this.isSubmitting = false;
        this.showSuccess = true;
        
        // Reset form
        this.meetingForm.reset({
          title: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00'
        });
        
        // Reset participants array
        while (this.participantsArray.length > 1) {
          this.participantsArray.removeAt(0);
        }
        this.participantsArray.at(0).reset();

        // Hide success message after 3 seconds
        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);
      }, 800);
    } else {
      // Mark all fields as touched to show validation errors
      this.meetingForm.markAllAsTouched();
    }
  }
}
