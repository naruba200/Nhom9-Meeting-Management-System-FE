import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Meeting, MeetingService } from '../../../services/meeting.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="meeting-list-container">
      <div class="list-header">
        <h2>Danh sách cuộc họp</h2>
        <span class="meeting-count">{{ meetings.length }} cuộc họp</span>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          *ngFor="let filter of filters"
          [class.active]="currentFilter === filter.value"
          (click)="setFilter(filter.value)"
          class="filter-btn"
        >
          {{ filter.label }}
          <span class="count-badge" *ngIf="getCountByStatus(filter.value) > 0">
            {{ getCountByStatus(filter.value) }}
          </span>
        </button>
      </div>

      <!-- Meeting Cards Grid -->
      <div class="meetings-grid">
        <div 
          *ngFor="let meeting of filteredMeetings" 
          class="meeting-card"
          [class.cancelled]="meeting.status === 'cancelled'"
          [class.ongoing]="meeting.status === 'ongoing'"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="status-indicator" [class]="meeting.status"></div>
            <span class="status-label">{{ getStatusLabel(meeting.status) }}</span>
          </div>

          <!-- Card Body -->
          <div class="card-body" (click)="openMeetingDetail(meeting)">
            <h3 class="meeting-title">{{ meeting.title }}</h3>
            
            <div class="meeting-info">
              <div class="info-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{{ formatDate(meeting.date) }}</span>
              </div>
              <div class="info-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{{ meeting.startTime }} - {{ meeting.endTime }}</span>
              </div>
            </div>

            <!-- Participants -->
            <div class="participants-section">
              <span class="participants-label">Người tham gia:</span>
              <div class="participants-avatars">
                <div 
                  *ngFor="let participant of meeting.participants.slice(0, 4); let i = index"
                  class="avatar"
                  [style.background-color]="getAvatarColor(i)"
                  [title]="participant.name"
                >
                  {{ participant.avatar || getInitials(participant.name) }}
                </div>
                <div 
                  *ngIf="meeting.participants.length > 4" 
                  class="avatar more"
                >
                  +{{ meeting.participants.length - 4 }}
                </div>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions" *ngIf="meeting.status !== 'cancelled'">
            <!-- Creator Actions -->
            <ng-container *ngIf="isCreator(meeting)">
              <button class="action-btn invite" (click)="inviteParticipants(meeting)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Invite
              </button>
              <button class="action-btn edit" (click)="editMeeting(meeting)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
              <button class="action-btn cancel" (click)="cancelMeeting(meeting)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Cancel
              </button>
            </ng-container>
            <!-- Participant Actions -->
            <ng-container *ngIf="!isCreator(meeting)">
              <button class="action-btn view-btn" (click)="viewMeeting(meeting)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Xem chi tiết
              </button>
            </ng-container>
          </div>

          <!-- Cancelled Overlay -->
          <div class="cancelled-overlay" *ngIf="meeting.status === 'cancelled'">
            <span>Đã hủy</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredMeetings.length === 0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>Không có cuộc họp nào</p>
      </div>
    </div>

    <!-- Meeting Detail Modal -->
    <div class="modal-overlay" *ngIf="selectedMeeting" (click)="closeMeetingDetail()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="modal-header-info">
            <div class="modal-status" [class]="selectedMeeting.status">
              <div class="status-dot"></div>
              <span>{{ getStatusLabel(selectedMeeting.status) }}</span>
            </div>
            <h2 class="modal-title">{{ selectedMeeting.title }}</h2>
          </div>
          <button class="close-btn" (click)="closeMeetingDetail()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Date & Time Section -->
          <div class="detail-section">
            <h3 class="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="section-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Thời gian
            </h3>
            <div class="detail-content">
              <div class="detail-row">
                <span class="detail-label">Ngày:</span>
                <span class="detail-value">{{ formatDate(selectedMeeting.date) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Giờ:</span>
                <span class="detail-value">{{ selectedMeeting.startTime }} - {{ selectedMeeting.endTime }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Thời lượng:</span>
                <span class="detail-value">{{ calculateDuration(selectedMeeting.startTime, selectedMeeting.endTime) }}</span>
              </div>
            </div>
          </div>

          <!-- Creator Section -->
          <div class="detail-section">
            <h3 class="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="section-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Người tạo
            </h3>
            <div class="detail-content">
              <div class="creator-info">
                <div class="creator-avatar" [style.background-color]="'#3b82f6'">{{ getInitials(selectedMeeting.createdBy.split('@')[0]) }}</div>
                <span class="creator-email">{{ selectedMeeting.createdBy }}</span>
                <span class="creator-badge" *ngIf="isCreator(selectedMeeting)">Bạn</span>
              </div>
            </div>
          </div>

          <!-- Participants Section -->
          <div class="detail-section">
            <h3 class="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="section-icon">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Người tham gia ({{ selectedMeeting.participants.length }})
            </h3>
            <div class="detail-content">
              <div class="participants-list">
                <div 
                  *ngFor="let participant of selectedMeeting.participants; let i = index"
                  class="participant-item"
                >
                  <div class="participant-avatar" [style.background-color]="getAvatarColor(i)">
                    {{ participant.avatar || getInitials(participant.name) }}
                  </div>
                  <div class="participant-info">
                    <span class="participant-name">{{ participant.name }}</span>
                    <span class="participant-email">{{ participant.email }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer" *ngIf="selectedMeeting.status !== 'cancelled'">
          <ng-container *ngIf="isCreator(selectedMeeting)">
            <button class="modal-btn secondary" (click)="editMeeting(selectedMeeting); closeMeetingDetail()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-btn-icon">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Chỉnh sửa
            </button>
            <button class="modal-btn danger" (click)="cancelMeeting(selectedMeeting); closeMeetingDetail()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-btn-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              Hủy cuộc họp
            </button>
          </ng-container>
          <button class="modal-btn primary" (click)="closeMeetingDetail()">
            Đóng
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .meeting-list-container {
      font-family: 'Inter', 'Roboto', sans-serif;
    }

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .list-header h2 {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .meeting-count {
      font-size: 14px;
      color: #6b7280;
      background-color: #f3f4f6;
      padding: 6px 12px;
      border-radius: 20px;
    }

    /* Filter Tabs */
    .filter-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .filter-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background-color: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .filter-btn:hover {
      background-color: #f9fafb;
      border-color: #d1d5db;
    }

    .filter-btn.active {
      background-color: #3b82f6;
      border-color: #3b82f6;
      color: #fff;
    }

    .count-badge {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
    }

    .filter-btn.active .count-badge {
      background-color: rgba(255, 255, 255, 0.2);
    }

    /* Meeting Cards Grid */
    .meetings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .meeting-card {
      background-color: #fff;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      transition: all 0.3s ease;
      position: relative;
    }

    .meeting-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
    }

    .meeting-card.cancelled {
      opacity: 0.7;
    }

    .meeting-card.ongoing {
      border-left: 4px solid #10b981;
    }

    /* Card Header */
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background-color: #f9fafb;
      border-bottom: 1px solid #f3f4f6;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-indicator.scheduled {
      background-color: #3b82f6;
    }

    .status-indicator.ongoing {
      background-color: #10b981;
      animation: pulse 2s infinite;
    }

    .status-indicator.completed {
      background-color: #6b7280;
    }

    .status-indicator.cancelled {
      background-color: #ef4444;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .status-label {
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Card Body */
    .card-body {
      padding: 16px;
    }

    .meeting-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 12px 0;
      line-height: 1.4;
    }

    .meeting-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #6b7280;
    }

    .icon {
      width: 16px;
      height: 16px;
      color: #9ca3af;
    }

    /* Participants */
    .participants-section {
      margin-top: 12px;
    }

    .participants-label {
      font-size: 12px;
      color: #9ca3af;
      display: block;
      margin-bottom: 8px;
    }

    .participants-avatars {
      display: flex;
      align-items: center;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      margin-left: -8px;
      border: 2px solid #fff;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .avatar:first-child {
      margin-left: 0;
    }

    .avatar:hover {
      transform: scale(1.1);
      z-index: 1;
    }

    .avatar.more {
      background-color: #9ca3af;
      font-size: 10px;
    }

    /* Card Actions */
    .card-actions {
      display: flex;
      border-top: 1px solid #f3f4f6;
      padding: 8px;
      gap: 4px;
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 8px;
      background-color: transparent;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-icon {
      width: 14px;
      height: 14px;
    }

    .action-btn.invite {
      color: #3b82f6;
    }

    .action-btn.invite:hover {
      background-color: #eff6ff;
    }

    .action-btn.edit {
      color: #f59e0b;
    }

    .action-btn.edit:hover {
      background-color: #fffbeb;
    }

    .action-btn.cancel {
      color: #ef4444;
    }

    .action-btn.cancel:hover {
      background-color: #fef2f2;
    }

    .action-btn.view-btn {
      color: #10b981;
      flex: 1;
    }

    .action-btn.view-btn:hover {
      background-color: #ecfdf5;
    }

    /* Cancelled Overlay */
    .cancelled-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-15deg);
      background-color: rgba(239, 68, 68, 0.9);
      color: #fff;
      padding: 8px 24px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #9ca3af;
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      font-size: 14px;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .meetings-grid {
        grid-template-columns: 1fr;
      }

      .filter-tabs {
        overflow-x: auto;
        padding-bottom: 8px;
      }

      .filter-btn {
        white-space: nowrap;
      }
    }

    /* Card Body Clickable */
    .card-body {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .card-body:hover {
      background-color: #fafafa;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background-color: #fff;
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #f3f4f6;
    }

    .modal-header-info {
      flex: 1;
    }

    .modal-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .modal-status.scheduled {
      background-color: #eff6ff;
      color: #3b82f6;
    }

    .modal-status.ongoing {
      background-color: #ecfdf5;
      color: #10b981;
    }

    .modal-status.completed {
      background-color: #f3f4f6;
      color: #6b7280;
    }

    .modal-status.cancelled {
      background-color: #fef2f2;
      color: #ef4444;
    }

    .modal-status .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
      line-height: 1.4;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f3f4f6;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background-color: #e5e7eb;
    }

    .close-btn svg {
      width: 18px;
      height: 18px;
      color: #6b7280;
    }

    .modal-body {
      padding: 20px 24px;
    }

    .detail-section {
      margin-bottom: 24px;
    }

    .detail-section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 12px 0;
    }

    .section-icon {
      width: 18px;
      height: 18px;
      color: #9ca3af;
    }

    .detail-content {
      background-color: #f9fafb;
      border-radius: 12px;
      padding: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .detail-row:first-child {
      padding-top: 0;
    }

    .detail-label {
      font-size: 13px;
      color: #6b7280;
    }

    .detail-value {
      font-size: 13px;
      font-weight: 500;
      color: #1f2937;
    }

    .creator-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .creator-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }

    .creator-email {
      font-size: 14px;
      color: #374151;
      font-weight: 500;
    }

    .creator-badge {
      background-color: #ecfdf5;
      color: #10b981;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .participants-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .participant-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .participant-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      flex-shrink: 0;
    }

    .participant-info {
      display: flex;
      flex-direction: column;
    }

    .participant-name {
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
    }

    .participant-email {
      font-size: 12px;
      color: #9ca3af;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid #f3f4f6;
      background-color: #f9fafb;
      border-radius: 0 0 16px 16px;
    }

    .modal-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .modal-btn-icon {
      width: 16px;
      height: 16px;
    }

    .modal-btn.primary {
      background-color: #3b82f6;
      color: #fff;
    }

    .modal-btn.primary:hover {
      background-color: #2563eb;
    }

    .modal-btn.secondary {
      background-color: #fff;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .modal-btn.secondary:hover {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }

    .modal-btn.danger {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .modal-btn.danger:hover {
      background-color: #fecaca;
    }
  `]
})
export class MeetingListComponent implements OnInit, OnDestroy {
  meetings: Meeting[] = [];
  filteredMeetings: Meeting[] = [];
  currentFilter = 'all';
  currentUser: any;
  selectedMeeting: Meeting | null = null;
  private subscription!: Subscription;

  filters = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang diễn ra', value: 'ongoing' },
    { label: 'Sắp tới', value: 'scheduled' },
    { label: 'Đã hủy', value: 'cancelled' }
  ];

  avatarColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.subscription = this.meetingService.getMeetings().subscribe(meetings => {
      this.meetings = meetings;
      this.applyFilter();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.currentFilter === 'all') {
      this.filteredMeetings = this.meetings;
    } else {
      this.filteredMeetings = this.meetings.filter(m => m.status === this.currentFilter);
    }
  }

  getCountByStatus(status: string): number {
    if (status === 'all') return this.meetings.length;
    return this.meetings.filter(m => m.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'scheduled': 'Sắp tới',
      'ongoing': 'Đang diễn ra',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return labels[status] || status;
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

  getAvatarColor(index: number): string {
    return this.avatarColors[index % this.avatarColors.length];
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  inviteParticipants(meeting: Meeting): void {
    alert(`Mời người tham gia vào cuộc họp: ${meeting.title}`);
  }

  editMeeting(meeting: Meeting): void {
    alert(`Chỉnh sửa cuộc họp: ${meeting.title}`);
  }

  cancelMeeting(meeting: Meeting): void {
    if (confirm(`Bạn có chắc muốn hủy cuộc họp "${meeting.title}"?`)) {
      this.meetingService.cancelMeeting(meeting.id);
    }
  }

  isCreator(meeting: Meeting): boolean {
    return this.currentUser?.email === meeting.createdBy;
  }

  viewMeeting(meeting: Meeting): void {
    this.openMeetingDetail(meeting);
  }

  openMeetingDetail(meeting: Meeting): void {
    this.selectedMeeting = meeting;
    document.body.style.overflow = 'hidden';
  }

  closeMeetingDetail(): void {
    this.selectedMeeting = null;
    document.body.style.overflow = '';
  }

  calculateDuration(startTime: string, endTime: string): string {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const diffMinutes = endMinutes - startMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    if (hours > 0 && minutes > 0) {
      return `${hours} giờ ${minutes} phút`;
    } else if (hours > 0) {
      return `${hours} giờ`;
    } else {
      return `${minutes} phút`;
    }
  }
}
