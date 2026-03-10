import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { MeetingListComponent } from './meeting-list/meeting-list.component';
import { CreateMeetingComponent } from './create-meeting/create-meeting.component';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MeetingListComponent, CreateMeetingComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="meetings-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Quản lý cuộc họp</h1>
          <p>Tạo và quản lý các cuộc họp của bạn</p>
        </div>
      </div>

      <div class="meetings-layout">
        <!-- Main Content - Meeting List (Left) -->
        <section class="content-section">
          <app-meeting-list></app-meeting-list>
        </section>

        <!-- Sidebar - Create Form (Right) -->
        <aside class="sidebar-section">
          <app-create-meeting></app-create-meeting>
        </aside>
      </div>
    </main>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .meetings-page {
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      font-family: 'Inter', 'Roboto', sans-serif;
    }

    .page-header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      padding: 32px 24px;
      color: #fff;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .page-header p {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
    }

    .meetings-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    .content-section {
      min-width: 0;
    }

    .sidebar-section {
      position: sticky;
      top: 88px;
      height: fit-content;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .meetings-layout {
        grid-template-columns: 1fr;
      }

      .sidebar-section {
        position: static;
        order: -1;
      }
    }

    @media (max-width: 640px) {
      .page-header {
        padding: 24px 16px;
      }

      .page-header h1 {
        font-size: 24px;
      }

      .meetings-layout {
        padding: 16px;
        gap: 16px;
      }
    }
  `]
})
export class MeetingsComponent {}
