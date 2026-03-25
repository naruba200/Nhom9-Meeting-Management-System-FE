import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MeetingListComponent } from './meeting-list/meeting-list.component';
import { CreateMeetingComponent } from './create-meeting/create-meeting.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [CommonModule, RouterModule, MeetingListComponent, CreateMeetingComponent, NavbarComponent],
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})
export class MeetingComponent {}
