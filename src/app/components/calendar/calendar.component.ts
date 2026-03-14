import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  viewMode: 'day' | 'week' | 'month' = 'week';
  
  weekDays: string[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  
  miniCalendarDays: (number | null)[] = [];
  miniCalendarMonth: Date = new Date();
  
  categories: CalendarCategory[] = [
    { id: '1', name: 'Cuộc họp', color: '#4285f4', checked: true },
    { id: '2', name: 'Công việc', color: '#0f9d58', checked: true },
    { id: '3', name: 'Cá nhân', color: '#f4b400', checked: true },
    { id: '4', name: 'Quan trọng', color: '#db4437', checked: true },
    { id: '5', name: 'Nhắc nhở', color: '#9c27b0', checked: true }
  ];
  
  events: CalendarEvent[] = [];
  weekDates: Date[] = [];
  
  showCreateModal: boolean = false;

  ngOnInit(): void {
    this.generateMiniCalendar();
    this.generateWeekDates();
    this.generateSampleEvents();
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

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  }

  generateSampleEvents(): void {
    const today = new Date();
    const startOfWeek = this.getStartOfWeek(today);
    
    this.events = [
      {
        id: '1',
        title: 'Sprint Planning',
        date: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 1),
        startHour: 9,
        endHour: 11,
        color: '#4285f4'
      },
      {
        id: '2',
        title: 'Team Standup',
        date: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 2),
        startHour: 10,
        endHour: 11,
        color: '#0f9d58'
      },
      {
        id: '3',
        title: 'Design Review',
        date: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 3),
        startHour: 14,
        endHour: 16,
        color: '#f4b400'
      },
      {
        id: '4',
        title: 'Client Meeting',
        date: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 4),
        startHour: 15,
        endHour: 17,
        color: '#db4437'
      },
      {
        id: '5',
        title: 'Code Review',
        date: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 5),
        startHour: 11,
        endHour: 12,
        color: '#9c27b0'
      },
      {
        id: '6',
        title: 'Lunch Meeting',
        date: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 2),
        startHour: 12,
        endHour: 13,
        color: '#4285f4'
      }
    ];
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
  }

  selectMiniCalendarDay(day: number | null): void {
    if (day) {
      this.currentDate = new Date(
        this.miniCalendarMonth.getFullYear(),
        this.miniCalendarMonth.getMonth(),
        day
      );
      this.generateWeekDates();
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
