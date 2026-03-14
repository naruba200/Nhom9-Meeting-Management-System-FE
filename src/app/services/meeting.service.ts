import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Meeting, CreateMeetingRequest, Participant } from '../models/meeting.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private meetings: Meeting[] = [
    {
      id: '1',
      title: 'Sprint Planning Meeting',
      date: '2026-03-12',
      startTime: '09:00',
      endTime: '10:30',
      participants: [
        { email: 'john@example.com', name: 'John Doe' },
        { email: 'jane@example.com', name: 'Jane Smith' },
        { email: 'bob@example.com', name: 'Bob Wilson' },
        { email: 'alice@example.com', name: 'Alice Brown' },
        { email: 'charlie@example.com', name: 'Charlie Davis' },
        { email: 'eve@example.com', name: 'Eve Miller' }
      ],
      status: 'scheduled',
      createdAt: new Date(),
      creatorEmail: 'admin@example.com'
    },
    {
      id: '2',
      title: 'Design Review',
      date: '2026-03-13',
      startTime: '14:00',
      endTime: '15:00',
      participants: [
        { email: 'alice@example.com', name: 'Alice Brown' },
        { email: 'charlie@example.com', name: 'Charlie Davis' }
      ],
      status: 'scheduled',
      createdAt: new Date(),
      creatorEmail: 'other@example.com'
    },
    {
      id: '3',
      title: 'Team Standup',
      date: '2026-03-11',
      startTime: '10:00',
      endTime: '10:15',
      participants: [
        { email: 'team@example.com', name: 'Team Lead' },
        { email: 'dev1@example.com', name: 'Developer 1' },
        { email: 'dev2@example.com', name: 'Developer 2' },
        { email: 'dev3@example.com', name: 'Developer 3' },
        { email: 'dev4@example.com', name: 'Developer 4' },
        { email: 'dev5@example.com', name: 'Developer 5' }
      ],
      status: 'scheduled',
      createdAt: new Date(),
      creatorEmail: 'admin@example.com'
    }
  ];

  private meetingsSubject = new BehaviorSubject<Meeting[]>(this.meetings);

  constructor(private authService: AuthService) {
    // Đặt người tạo cuộc họp đầu tiên là user hiện tại để test
    const userInfo = this.authService.getUserInfo();
    if (userInfo?.email && this.meetings.length > 0) {
      this.meetings[0].creatorEmail = userInfo.email;
      this.meetingsSubject.next(this.meetings);
    }
  }

  getMeetings(): Observable<Meeting[]> {
    return this.meetingsSubject.asObservable();
  }

  getMeetingsValue(): Meeting[] {
    return this.meetingsSubject.getValue();
  }

  addMeeting(request: CreateMeetingRequest): Meeting {
    const participants: Participant[] = request.participantEmails.map(email => ({
      email,
      name: email.split('@')[0]
    }));

    const userInfo = this.authService.getUserInfo();
    const creatorEmail = userInfo?.email || 'unknown@example.com';

    const newMeeting: Meeting = {
      id: this.generateId(),
      title: request.title,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      participants,
      status: 'scheduled',
      createdAt: new Date(),
      creatorEmail: creatorEmail
    };

    this.meetings = [newMeeting, ...this.meetings];
    this.meetingsSubject.next(this.meetings);
    return newMeeting;
  }

  updateMeeting(id: string, updates: Partial<Meeting>): void {
    this.meetings = this.meetings.map(meeting =>
      meeting.id === id ? { ...meeting, ...updates } : meeting
    );
    this.meetingsSubject.next(this.meetings);
  }

  cancelMeeting(id: string): void {
    this.meetings = this.meetings.map(meeting =>
      meeting.id === id ? { ...meeting, status: 'cancelled' as const } : meeting
    );
    this.meetingsSubject.next(this.meetings);
  }

  deleteMeeting(id: string): void {
    this.meetings = this.meetings.filter(meeting => meeting.id !== id);
    this.meetingsSubject.next(this.meetings);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
