import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MeetingListComponent } from './meeting-list/meeting-list.component';
import { CreateMeetingComponent } from './create-meeting/create-meeting.component';
import { AuthService } from '../../services/auth.service';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [CommonModule, RouterModule, MeetingListComponent, CreateMeetingComponent, UserMenuComponent],
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})
export class MeetingComponent {
  userInfo: { email: string; fullName: string } | null = null;

  constructor(private authService: AuthService) {
    this.userInfo = this.authService.getUserInfo();
  }
}
