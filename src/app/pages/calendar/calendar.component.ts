import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

interface CalendarEvent {
  id: number;
  title: string;
  startHour: number;
  endHour: number;
  dayOfWeek: number;
  color: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <div class="calendar-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Create Button -->
        <button class="create-btn" (click)="openCreateEvent()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Tạo</span>
        </button>

        <!-- Mini Calendar -->
        <div class="mini-calendar">
          <div class="mini-calendar-header">
            <button class="mini-nav-btn" (click)="prevMiniMonth()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span class="mini-month-year">{{ miniCalendarMonthYear }}</span>
            <button class="mini-nav-btn" (click)="nextMiniMonth()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          <div class="mini-calendar-weekdays">
            <span *ngFor="let day of miniWeekdays">{{ day }}</span>
          </div>
          <div class="mini-calendar-days">
            <span 
              *ngFor="let day of miniCalendarDays" 
              [class.other-month]="day.otherMonth"
              [class.today]="day.isToday"
              [class.selected]="day.isSelected"
              (click)="selectMiniDate(day)"
            >
              {{ day.date }}
            </span>
          </div>
        </div>

        <!-- Calendar Categories -->
        <div class="calendar-categories">
          <h3>Lịch của tôi</h3>
          <div class="category-item" *ngFor="let category of categories">
            <input type="checkbox" [checked]="category.checked" (change)="toggleCategory(category)">
            <span class="category-color" [style.background-color]="category.color"></span>
            <span class="category-name">{{ category.name }}</span>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Header -->
        <header class="calendar-header">
          <div class="header-left">
            <button class="today-btn" (click)="goToToday()">Hôm nay</button>
            <div class="nav-buttons">
              <button class="nav-btn" (click)="prevWeek()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button class="nav-btn" (click)="nextWeek()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
            <h2 class="current-month-year">{{ currentMonthYear }}</h2>
          </div>
          <div class="header-right">
            <div class="view-tabs">
              <button 
                *ngFor="let view of viewModes" 
                [class.active]="currentView === view.value"
                (click)="setView(view.value)"
              >
                {{ view.label }}
              </button>
            </div>
          </div>
        </header>

        <!-- Week View Grid -->
        <div class="week-grid" *ngIf="currentView === 'week'">
          <!-- Timeline Header -->
          <div class="grid-header">
            <div class="time-gutter"></div>
            <div class="day-header" *ngFor="let day of weekDays" [class.today]="day.isToday">
              <span class="day-name">{{ day.dayName }}</span>
              <span class="day-number" [class.today-number]="day.isToday">{{ day.date }}</span>
            </div>
          </div>

          <!-- Time Grid -->
          <div class="grid-body">
            <div class="time-column">
              <div class="time-slot" *ngFor="let hour of hours">
                <span class="time-label">{{ formatHour(hour) }}</span>
              </div>
            </div>
            <div class="days-column">
              <div class="day-column" *ngFor="let day of weekDays; let dayIndex = index">
                <div class="hour-slot" *ngFor="let hour of hours">
                  <!-- Events -->
                  <div 
                    *ngFor="let event of getEventsForDayHour(dayIndex, hour)"
                    class="event-card"
                    [style.background-color]="event.color"
                    [style.height.px]="getEventHeight(event)"
                    [style.top.px]="getEventTop(event, hour)"
                  >
                    <span class="event-title">{{ event.title }}</span>
                    <span class="event-time">{{ formatEventTime(event) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Day View -->
        <div class="day-grid" *ngIf="currentView === 'day'">
          <div class="grid-header">
            <div class="time-gutter"></div>
            <div class="day-header today">
              <span class="day-name">{{ selectedDayInfo.dayName }}</span>
              <span class="day-number today-number">{{ selectedDayInfo.date }}</span>
            </div>
          </div>
          <div class="grid-body">
            <div class="time-column">
              <div class="time-slot" *ngFor="let hour of hours">
                <span class="time-label">{{ formatHour(hour) }}</span>
              </div>
            </div>
            <div class="days-column single-day">
              <div class="day-column">
                <div class="hour-slot" *ngFor="let hour of hours">
                  <div 
                    *ngFor="let event of getEventsForDayHour(selectedDayIndex, hour)"
                    class="event-card"
                    [style.background-color]="event.color"
                    [style.height.px]="getEventHeight(event)"
                    [style.top.px]="getEventTop(event, hour)"
                  >
                    <span class="event-title">{{ event.title }}</span>
                    <span class="event-time">{{ formatEventTime(event) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Month View -->
        <div class="month-grid" *ngIf="currentView === 'month'">
          <div class="month-header">
            <div class="month-day-name" *ngFor="let day of miniWeekdays">{{ day }}</div>
          </div>
          <div class="month-body">
            <div 
              *ngFor="let day of monthDays" 
              class="month-cell"
              [class.other-month]="day.otherMonth"
              [class.today]="day.isToday"
            >
              <span class="month-date">{{ day.date }}</span>
              <div class="month-events">
                <div 
                  *ngFor="let event of getEventsForMonthDay(day)"
                  class="month-event"
                  [style.background-color]="event.color"
                >
                  {{ event.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  selectedDate = new Date();
  miniCalendarDate = new Date();
  currentView: 'day' | 'week' | 'month' = 'week';
  selectedDayIndex = 0;

  miniWeekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  hours = Array.from({ length: 24 }, (_, i) => i);

  viewModes = [
    { label: 'Ngày', value: 'day' as const },
    { label: 'Tuần', value: 'week' as const },
    { label: 'Tháng', value: 'month' as const }
  ];

  categories = [
    { name: 'Công việc', color: '#1a73e8', checked: true },
    { name: 'Cá nhân', color: '#34a853', checked: true },
    { name: 'Gia đình', color: '#ea4335', checked: true },
    { name: 'Sinh nhật', color: '#fbbc04', checked: true },
    { name: 'Ngày lễ', color: '#9334ea', checked: true }
  ];

  events: CalendarEvent[] = [
    { id: 1, title: 'Họp team Sprint Planning', startHour: 9, endHour: 11, dayOfWeek: 1, color: '#1a73e8' },
    { id: 2, title: 'Review code dự án', startHour: 14, endHour: 15, dayOfWeek: 1, color: '#34a853' },
    { id: 3, title: 'Cuộc họp khách hàng', startHour: 10, endHour: 12, dayOfWeek: 2, color: '#ea4335' },
    { id: 4, title: 'Lunch meeting', startHour: 12, endHour: 13, dayOfWeek: 3, color: '#fbbc04' },
    { id: 5, title: 'Training Angular', startHour: 15, endHour: 17, dayOfWeek: 3, color: '#9334ea' },
    { id: 6, title: 'Demo sản phẩm', startHour: 9, endHour: 10, dayOfWeek: 4, color: '#1a73e8' },
    { id: 7, title: 'Team Building', startHour: 16, endHour: 18, dayOfWeek: 5, color: '#34a853' },
    { id: 8, title: 'Workshop UI/UX', startHour: 13, endHour: 15, dayOfWeek: 2, color: '#1a73e8' }
  ];

  miniCalendarDays: any[] = [];
  weekDays: any[] = [];
  monthDays: any[] = [];

  ngOnInit() {
    this.generateMiniCalendar();
    this.generateWeekDays();
    this.generateMonthDays();
  }

  get currentMonthYear(): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return this.currentDate.toLocaleDateString('vi-VN', options);
  }

  get miniCalendarMonthYear(): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return this.miniCalendarDate.toLocaleDateString('vi-VN', options);
  }

  get selectedDayInfo(): any {
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return {
      dayName: dayNames[this.selectedDate.getDay()],
      date: this.selectedDate.getDate()
    };
  }

  generateMiniCalendar() {
    const year = this.miniCalendarDate.getFullYear();
    const month = this.miniCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const today = new Date();
    this.miniCalendarDays = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      this.miniCalendarDays.push({
        date: prevMonthLastDay - i,
        otherMonth: true,
        isToday: false,
        isSelected: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && 
                      today.getMonth() === month && 
                      today.getFullYear() === year;
      const isSelected = this.selectedDate.getDate() === i && 
                         this.selectedDate.getMonth() === month && 
                         this.selectedDate.getFullYear() === year;
      this.miniCalendarDays.push({
        date: i,
        otherMonth: false,
        isToday,
        isSelected,
        fullDate: new Date(year, month, i)
      });
    }

    // Next month days
    const remaining = 42 - this.miniCalendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      this.miniCalendarDays.push({
        date: i,
        otherMonth: true,
        isToday: false,
        isSelected: false
      });
    }
  }

  generateWeekDays() {
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    const currentDay = this.currentDate.getDay();
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - currentDay);

    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      this.weekDays.push({
        dayName: dayNames[i],
        date: day.getDate(),
        isToday: day.toDateString() === today.toDateString(),
        fullDate: day
      });
    }
  }

  generateMonthDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const today = new Date();
    this.monthDays = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      this.monthDays.push({
        date: prevMonthLastDay - i,
        otherMonth: true,
        isToday: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && 
                      today.getMonth() === month && 
                      today.getFullYear() === year;
      this.monthDays.push({
        date: i,
        otherMonth: false,
        isToday,
        fullDate: new Date(year, month, i)
      });
    }

    // Next month days
    const remaining = 42 - this.monthDays.length;
    for (let i = 1; i <= remaining; i++) {
      this.monthDays.push({
        date: i,
        otherMonth: true,
        isToday: false,
        fullDate: new Date(year, month + 1, i)
      });
    }
  }

  formatHour(hour: number): string {
    if (hour === 0) return '12 SA';
    if (hour < 12) return `${hour} SA`;
    if (hour === 12) return '12 CH';
    return `${hour - 12} CH`;
  }

  formatEventTime(event: CalendarEvent): string {
    return `${this.formatHour(event.startHour)} - ${this.formatHour(event.endHour)}`;
  }

  getEventsForDayHour(dayIndex: number, hour: number): CalendarEvent[] {
    return this.events.filter(e => 
      e.dayOfWeek === dayIndex && e.startHour === hour
    );
  }

  getEventsForMonthDay(day: any): CalendarEvent[] {
    if (day.otherMonth) return [];
    const dayOfWeek = day.fullDate.getDay();
    return this.events.filter(e => e.dayOfWeek === dayOfWeek).slice(0, 2);
  }

  getEventHeight(event: CalendarEvent): number {
    return (event.endHour - event.startHour) * 48 - 4;
  }

  getEventTop(event: CalendarEvent, currentHour: number): number {
    return 0;
  }

  prevWeek() {
    this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() - 7));
    this.generateWeekDays();
    this.generateMonthDays();
  }

  nextWeek() {
    this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() + 7));
    this.generateWeekDays();
    this.generateMonthDays();
  }

  goToToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.miniCalendarDate = new Date();
    this.generateMiniCalendar();
    this.generateWeekDays();
    this.generateMonthDays();
  }

  prevMiniMonth() {
    this.miniCalendarDate = new Date(this.miniCalendarDate.setMonth(this.miniCalendarDate.getMonth() - 1));
    this.generateMiniCalendar();
  }

  nextMiniMonth() {
    this.miniCalendarDate = new Date(this.miniCalendarDate.setMonth(this.miniCalendarDate.getMonth() + 1));
    this.generateMiniCalendar();
  }

  selectMiniDate(day: any) {
    if (day.fullDate) {
      this.selectedDate = day.fullDate;
      this.currentDate = new Date(day.fullDate);
      this.selectedDayIndex = day.fullDate.getDay();
      this.generateMiniCalendar();
      this.generateWeekDays();
      this.generateMonthDays();
    }
  }

  setView(view: 'day' | 'week' | 'month') {
    this.currentView = view;
  }

  toggleCategory(category: any) {
    category.checked = !category.checked;
  }

  openCreateEvent() {
    alert('Tạo sự kiện mới - Tính năng đang phát triển!');
  }
}
