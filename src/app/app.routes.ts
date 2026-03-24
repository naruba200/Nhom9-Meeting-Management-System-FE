import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { VerifyOtpComponent } from './components/verify-otp/verify-otp.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { MeetingComponent } from './components/meeting/meeting.component';
import { MeetingHistoryComponent } from './components/meeting/meeting-history/meeting-history.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { InvitationsWeekComponent } from './components/invitations-week/invitations-week.component';
import { InvitationsHistoryComponent } from './components/invitations-history/invitations-history.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminProfile } from './components/admin/admin-profile/admin-profile';
import { AdminNotifications } from './components/admin/admin-notifications/admin-notifications';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users.component';
import { AdminFileManagementComponent } from './components/admin/admin-file-management/admin-file-management.component';
import { TasksPageComponent } from './components/tasks-page/tasks-page.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { UserGuard } from './guards/user.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  { path: 'verify-otp', component: VerifyOtpComponent, canActivate: [NoAuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [NoAuthGuard] },
  { path: 'homepage', component: HomepageComponent, canActivate: [UserGuard] },
  { path: 'meeting', component: MeetingComponent, canActivate: [UserGuard] },
  { path: 'meeting/history', component: MeetingHistoryComponent, canActivate: [UserGuard] },
  { path: 'invitations', component: InvitationsWeekComponent, canActivate: [UserGuard] },
  { path: 'invitations/history', component: InvitationsHistoryComponent, canActivate: [UserGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [UserGuard] },
  { path: 'tasks', component: TasksPageComponent, canActivate: [UserGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [UserGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [UserGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [UserGuard] },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'profile', component: AdminProfile },
      { path: 'notifications', component: AdminNotifications },
      { path: 'users', component: AdminUsersComponent },
      { path: 'files', component: AdminFileManagementComponent }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
