import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Participant {
  email: string;
  name: string;
  avatar?: string;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: Participant[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private meetings: Meeting[] = [
    {
      id: 1,
      title: 'Sprint Planning Meeting',
      date: '2026-03-10',
      startTime: '09:00',
      endTime: '11:00',
      participants: [
        { email: 'john@example.com', name: 'John Doe', avatar: 'JD' },
        { email: 'jane@example.com', name: 'Jane Smith', avatar: 'JS' },
        { email: 'mike@example.com', name: 'Mike Johnson', avatar: 'MJ' }
      ],
      status: 'scheduled',
      createdBy: 'user@example.com',
      createdAt: new Date()
    },
    {
      id: 2,
      title: 'Design Review',
      date: '2026-03-11',
      startTime: '14:00',
      endTime: '15:30',
      participants: [
        { email: 'sarah@example.com', name: 'Sarah Wilson', avatar: 'SW' },
        { email: 'tom@example.com', name: 'Tom Brown', avatar: 'TB' }
      ],
      status: 'scheduled',
      createdBy: 'admin@example.com',
      createdAt: new Date()
    },
    {
      id: 3,
      title: 'Client Presentation',
      date: '2026-03-12',
      startTime: '10:00',
      endTime: '12:00',
      participants: [
        { email: 'client@company.com', name: 'Client Team', avatar: 'CT' },
        { email: 'pm@example.com', name: 'Project Manager', avatar: 'PM' },
        { email: 'dev@example.com', name: 'Dev Lead', avatar: 'DL' },
        { email: 'designer@example.com', name: 'Designer', avatar: 'DE' },
        { email: 'user@example.com', name: 'John Doe', avatar: 'JD' },
        { email: 'qa@example.com', name: 'QA Engineer', avatar: 'QA' }
      ],
      status: 'scheduled',
      createdBy: 'admin@example.com',
      createdAt: new Date()
    },
    {
      id: 4,
      title: 'Team Standup',
      date: '2026-03-10',
      startTime: '09:30',
      endTime: '10:00',
      participants: [
        { email: 'team1@example.com', name: 'Team Member 1', avatar: 'T1' },
        { email: 'team2@example.com', name: 'Team Member 2', avatar: 'T2' }
      ],
      status: 'ongoing',
      createdBy: 'user@example.com',
      createdAt: new Date()
    }
  ];

  private meetingsSubject = new BehaviorSubject<Meeting[]>(this.meetings);

  getMeetings(): Observable<Meeting[]> {
    return this.meetingsSubject.asObservable();
  }

  getMeetingsValue(): Meeting[] {
    return this.meetingsSubject.getValue();
  }

  addMeeting(meeting: Omit<Meeting, 'id' | 'createdAt' | 'status'>): void {
    const newMeeting: Meeting = {
      ...meeting,
      id: this.generateId(),
      status: 'scheduled',
      createdAt: new Date()
    };
    this.meetings = [...this.meetings, newMeeting];
    this.meetingsSubject.next(this.meetings);
  }

  updateMeeting(id: number, updates: Partial<Meeting>): void {
    this.meetings = this.meetings.map(meeting =>
      meeting.id === id ? { ...meeting, ...updates } : meeting
    );
    this.meetingsSubject.next(this.meetings);
  }

  cancelMeeting(id: number): void {
    this.updateMeeting(id, { status: 'cancelled' });
  }

  deleteMeeting(id: number): void {
    this.meetings = this.meetings.filter(meeting => meeting.id !== id);
    this.meetingsSubject.next(this.meetings);
  }

  private generateId(): number {
    return Math.max(0, ...this.meetings.map(m => m.id)) + 1;
  }
}
