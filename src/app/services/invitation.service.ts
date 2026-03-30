import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DeclineInvitationRequest, InvitationItem } from '../models/invitation.models';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private readonly apiUrl = `${environment.apiUrl}/api/invitations`;

  constructor(private http: HttpClient) {}

  getWeeklyInvitations(): Observable<InvitationItem[]> {
    return this.http.get<InvitationItem[]>(`${this.apiUrl}/weekly`);
  }

  getInvitationHistory(): Observable<InvitationItem[]> {
    return this.http.get<InvitationItem[]>(`${this.apiUrl}/history`);
  }

  acceptInvitation(attendeeId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${attendeeId}/accept`, {});
  }

  declineInvitation(attendeeId: number, request: DeclineInvitationRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${attendeeId}/decline`, request);
  }
}
