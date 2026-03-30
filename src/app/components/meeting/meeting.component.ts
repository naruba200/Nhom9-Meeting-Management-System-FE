import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MeetingListComponent } from './meeting-list/meeting-list.component';
import { CreateMeetingComponent } from './create-meeting/create-meeting.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ModalOverlayService } from '../../services/modal-overlay.service';

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [CommonModule, RouterModule, MeetingListComponent, CreateMeetingComponent, NavbarComponent],
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})
export class MeetingComponent {
  private readonly modalOverlayService = inject(ModalOverlayService);
  modalOpen$ = this.modalOverlayService.modalOpen$;
}
