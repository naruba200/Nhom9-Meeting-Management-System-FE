import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserMenuComponent } from '../../user-menu/user-menu.component';

@Component({
  selector: 'admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule, UserMenuComponent],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent {
  @Input() userInfo: { email: string; fullName: string } | null = null;
}
