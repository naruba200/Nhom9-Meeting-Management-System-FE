import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateMeetingMinutesRequest,
  MeetingMinutes,
  MeetingMinutesResponse,
  SignMeetingMinutesRequest,
  UpdateMeetingMinutesRequest
} from '../models/minutes.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingMinutesService {
  private readonly apiUrl = `${environment.apiUrl}/api/meeting-minutes`;

  constructor(private http: HttpClient) {}

  getMinutesByMeeting(meetingId: number): Observable<MeetingMinutesResponse | null> {
    return this.http.get<MeetingMinutesResponse | null>(`${this.apiUrl}/meeting/${meetingId}`);
  }

  getMinutesById(minutesId: number): Observable<MeetingMinutesResponse> {
    return this.http.get<MeetingMinutesResponse>(`${this.apiUrl}/${minutesId}`);
  }

  createMinutes(meetingId: number, request: CreateMeetingMinutesRequest): Observable<MeetingMinutesResponse> {
    return this.http.post<MeetingMinutesResponse>(`${this.apiUrl}/meeting/${meetingId}`, request);
  }

  updateMinutes(minutesId: number, request: UpdateMeetingMinutesRequest): Observable<MeetingMinutesResponse> {
    return this.http.put<MeetingMinutesResponse>(`${this.apiUrl}/${minutesId}`, request);
  }

  signMinutes(minutesId: number, request: SignMeetingMinutesRequest): Observable<MeetingMinutesResponse> {
    return this.http.post<MeetingMinutesResponse>(`${this.apiUrl}/${minutesId}/sign`, request);
  }

  finalizeMinutes(minutesId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${minutesId}/finalize`, {});
  }

  deleteMinutes(minutesId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${minutesId}`);
  }
}
