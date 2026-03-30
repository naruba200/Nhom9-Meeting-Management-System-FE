import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MeetingService } from '../../services/meeting.service';
import { Meeting } from '../../models/meeting.models';
import { NavbarComponent } from '../navbar/navbar.component';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startHour: number;
  endHour: number;
  color: string;
}

interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  checked: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  viewMode: 'day' | 'week' | 'month' = 'week';

  weekDays: string[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);

  miniCalendarDays: (number | null)[] = [];
  miniCalendarMonth: Date = new Date();

  categories: CalendarCategory[] = [
    { id: 'meeting', name: 'Cuộc họp', color: '#4285f4', checked: true }
  ];

  events: CalendarEvent[] = [];
  weekDates: Date[] = [];
  monthDates: (Date | null)[] = [];
  loading = false;
  errorMessage = '';
  private readonly subscriptions: Subscription[] = [];

  showCreateModal: boolean = false;

  constructor(
    private meetingService: MeetingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[Calendar] Bỏ qua load meetings khi đang render phía server');
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    console.log('[Calendar] Bắt đầu tải lịch');
    this.generateMiniCalendar();
    this.generateWeekDates();
    this.generateMonthDates();
    this.subscribeMeetings();
    this.loadMeetings();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  generateMiniCalendar(): void {
    const year = this.miniCalendarMonth.getFullYear();
    const month = this.miniCalendarMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    this.miniCalendarDays = [];
    
    for (let i = 0; i < startPadding; i++) {
      this.miniCalendarDays.push(null);
    }
    
    for (let i = 1; i <= totalDays; i++) {
      this.miniCalendarDays.push(i);
    }
  }

  generateWeekDates(): void {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    this.weekDates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      this.weekDates.push(date);
    }
  }

  generateMonthDates(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    this.monthDates = [];

    for (let i = 0; i < startPadding; i++) {
      this.monthDates.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      this.monthDates.push(new Date(year, month, i));
    }
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  }

  private subscribeMeetings(): void {
    const sub = this.meetingService.getMeetings().subscribe((meetings) => {
      this.events = meetings
        .filter((meeting) => meeting.status !== 'cancelled')
        .map((meeting) => this.mapMeetingToCalendarEvent(meeting));
    });
    this.subscriptions.push(sub);
  }

  private loadMeetings(): void {
    this.loading = true;
    this.errorMessage = '';

    const sub = this.meetingService.loadMeetings().subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Không thể tải dữ liệu cuộc họp cho lịch.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    this.subscriptions.push(sub);
  }

  private mapMeetingToCalendarEvent(meeting: Meeting): CalendarEvent {
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    const startHour = start.getHours();
    const endHourRaw = end.getHours() + (end.getMinutes() > 0 ? 1 : 0);

    return {
      id: String(meeting.id),
      title: meeting.title,
      date: start,
      startHour,
      endHour: Math.max(startHour + 1, endHourRaw),
      color: '#4285f4'
    };
  }

  get currentMonthYear(): string {
    return this.currentDate.toLocaleDateString('vi-VN', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  get miniCalendarMonthYear(): string {
    return this.miniCalendarMonth.toLocaleDateString('vi-VN', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  navigateToday(): void {
    this.currentDate = new Date();
    this.miniCalendarMonth = new Date();
    this.generateMiniCalendar();
    this.generateWeekDates();
    this.generateMonthDates();
  }

  navigatePrev(): void {
    if (this.viewMode === 'week') {
      this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() - 7));
    } else if (this.viewMode === 'month') {
      this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1));
    } else {
      this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() - 1));
    }
    this.generateWeekDates();
    this.generateMonthDates();
  }

  navigateNext(): void {
    if (this.viewMode === 'week') {
      this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() + 7));
    } else if (this.viewMode === 'month') {
      this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + 1));
    } else {
      this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() + 1));
    }
    this.generateWeekDates();
    this.generateMonthDates();
  }

  miniCalendarPrev(): void {
    this.miniCalendarMonth = new Date(this.miniCalendarMonth.setMonth(this.miniCalendarMonth.getMonth() - 1));
    this.generateMiniCalendar();
  }

  miniCalendarNext(): void {
    this.miniCalendarMonth = new Date(this.miniCalendarMonth.setMonth(this.miniCalendarMonth.getMonth() + 1));
    this.generateMiniCalendar();
  }

  setViewMode(mode: 'day' | 'week' | 'month'): void {
    this.viewMode = mode;
    if (mode === 'month') {
      this.generateMonthDates();
    } else if (mode === 'week') {
      this.generateWeekDates();
    }
  }

  selectMiniCalendarDay(day: number | null): void {
    if (day) {
      this.currentDate = new Date(
        this.miniCalendarMonth.getFullYear(),
        this.miniCalendarMonth.getMonth(),
        day
      );
      this.generateWeekDates();
      this.generateMonthDates();
    }
  }

  toggleCategory(category: CalendarCategory): void {
    category.checked = !category.checked;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isMiniCalendarToday(day: number | null): boolean {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() &&
           this.miniCalendarMonth.getMonth() === today.getMonth() &&
           this.miniCalendarMonth.getFullYear() === today.getFullYear();
  }

  getEventsForDateAndHour(date: Date, hour: number): CalendarEvent[] {
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear() &&
             event.startHour === hour &&
             this.categories.find(c => c.color === event.color)?.checked;
    });
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear() &&
             this.categories.find(c => c.color === event.color)?.checked;
    });
  }

  getEventHeight(event: CalendarEvent): number {
    return (event.endHour - event.startHour) * 48;
  }

  formatHour(hour: number): string {
    return hour.toString().padStart(2, '0') + ':00';
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }
}
