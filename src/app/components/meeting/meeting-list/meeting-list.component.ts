import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Meeting } from '../../../models/meeting.models';
import { MeetingService } from '../../../services/meeting.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-list.component.html',
  styleUrls: ['./meeting-list.component.css']
})
export class MeetingListComponent implements OnInit, OnDestroy {
  meetings: Meeting[] = [];
  currentUserEmail: string = '';
  selectedMeeting: Meeting | null = null;
  showDetailModal: boolean = false;
  private subscription!: Subscription;

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscription = this.meetingService.getMeetings().subscribe(meetings => {
      this.meetings = meetings;
    });
    
    const userInfo = this.authService.getUserInfo();
    this.currentUserEmail = userInfo?.email || '';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  }

  onInvite(meeting: Meeting): void {
    console.log('Invite clicked for meeting:', meeting.title);
    // TODO: Implement invite functionality
    alert(`Mời tham gia cuộc họp: ${meeting.title}`);
  }

  onEdit(meeting: Meeting): void {
    console.log('Edit clicked for meeting:', meeting.title);
    // TODO: Implement edit functionality
    alert(`Chỉnh sửa cuộc họp: ${meeting.title}`);
  }

  onCancel(meeting: Meeting): void {
    if (confirm(`Bạn có chắc muốn hủy cuộc họp "${meeting.title}"?`)) {
      this.meetingService.cancelMeeting(meeting.id);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
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
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
    }
  }

  isCreator(meeting: Meeting): boolean {
    return meeting.creatorEmail === this.currentUserEmail;
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
  }

  onModalBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeDetailModal();
    }
  }
}
