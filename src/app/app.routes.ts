import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { VerifyOtpComponent } from './components/verify-otp/verify-otp.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { MeetingComponent } from './components/meeting/meeting.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },
  { path: 'forgot-password', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'homepage', component: HomepageComponent, canActivate: [AuthGuard] },
  { path: 'meeting', component: MeetingComponent, canActivate: [AuthGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
