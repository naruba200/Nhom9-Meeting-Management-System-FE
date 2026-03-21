import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import {
  AgendaItem,
  AgendaItemApiResponse,
  CreateMeetingApiRequest,
  CreateMeetingRequest,
  InviteMeetingRequest,
  MeetingAttendeeApiResponse,
  Meeting,
  MeetingApiResponse,
  MeetingStatus,
  ParticipantInvitationStatus,
  Participant,
  UpdateMeetingRequest,
} from '../models/meeting.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private readonly apiUrl = `${environment.apiUrl}/api/meetings`;
  private readonly meetingsSubject = new BehaviorSubject<Meeting[]>([]);

  constructor(private http: HttpClient) {}

  getMeetings(): Observable<Meeting[]> {
    return this.meetingsSubject.asObservable();
  }

  loadMeetings(): Observable<Meeting[]> {
    return this.http.get<MeetingApiResponse[]>(this.apiUrl).pipe(
      map((apiMeetings) => apiMeetings.map((item) => this.mapFromApi(item))),
      tap((meetings) => this.meetingsSubject.next(meetings))
    );
  }

  addMeeting(request: CreateMeetingRequest): Observable<Meeting> {
    const participants: Participant[] = request.participantEmails.map(email => ({
      email,
      name: email.split('@')[0]
    }));

    const payload: CreateMeetingApiRequest = {
      title: request.title.trim(),
      agenda: request.agenda?.trim() || undefined,
      agendaItems: request.agendaItems?.map((item, index) => ({
        title: item.title.trim(),
        durationMinutes: item.durationMinutes,
        description: item.description?.trim() || undefined,
        itemOrder: index + 1,
      })),
      startTime: this.toApiDateTime(request.date, request.startTime),
      endTime: this.toApiDateTime(request.date, request.endTime),
      syncWithGoogleCalendar: request.syncWithGoogleCalendar,
      externalMeetingLink: request.externalMeetingLink?.trim() || undefined,
      timezone: request.timezone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone,
      attendeeEmails: request.participantEmails,
    };

    return this.http.post<MeetingApiResponse>(this.apiUrl, payload).pipe(
      map((apiMeeting) => {
        const mapped = this.mapFromApi(apiMeeting);
        return {
          ...mapped,
          participants,
        };
      }),
      tap((newMeeting) => {
        this.meetingsSubject.next([newMeeting, ...this.meetingsSubject.getValue()]);
      })
    );
  }

  cancelMeeting(id: number): Observable<Meeting> {
    return this.http.put<MeetingApiResponse>(`${this.apiUrl}/${id}/cancel`, {}).pipe(
      map((apiMeeting) => {
        const previous = this.meetingsSubject.getValue().find((meeting) => meeting.id === id);
        const mapped = this.mapFromApi(apiMeeting);
        return {
          ...mapped,
          participants: previous?.participants ?? [],
        };
      }),
      tap((cancelledMeeting) => {
        this.meetingsSubject.next(
          this.meetingsSubject.getValue().map((meeting) =>
            meeting.id === cancelledMeeting.id ? { ...meeting, ...cancelledMeeting } : meeting
          )
        );
      })
    );
  }

  updateMeeting(id: number, request: UpdateMeetingRequest): Observable<Meeting> {
    const payload = {
      title: request.title.trim(),
      agenda: request.agenda?.trim() || undefined,
      agendaItems: request.agendaItems?.map((item, index) => ({
        title: item.title.trim(),
        durationMinutes: item.durationMinutes,
        description: item.description?.trim() || undefined,
        itemOrder: index + 1,
      })),
      startTime: this.toApiDateTime(request.date, request.startTime),
      endTime: this.toApiDateTime(request.date, request.endTime),
      externalMeetingLink: request.externalMeetingLink?.trim() || undefined,
      syncWithGoogleCalendar: request.syncWithGoogleCalendar ?? false,
      timezone: request.timezone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    return this.http.put<MeetingApiResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      map((apiMeeting) => {
        const previous = this.meetingsSubject.getValue().find((meeting) => meeting.id === id);
        const mapped = this.mapFromApi(apiMeeting);
        return {
          ...mapped,
          participants: previous?.participants ?? [],
        };
      }),
      tap((updatedMeeting) => {
        this.meetingsSubject.next(
          this.meetingsSubject.getValue().map((meeting) =>
            meeting.id === updatedMeeting.id ? { ...meeting, ...updatedMeeting } : meeting
          )
        );
      })
    );
  }

  updateMeetingAgenda(id: number, agendaItems: AgendaItem[]): Observable<Meeting> {
    const payload = {
      agendaItems: agendaItems.map((item, index) => ({
        title: item.title.trim(),
        durationMinutes: item.durationMinutes,
        description: item.description?.trim() || undefined,
        itemOrder: index + 1,
      })),
    };

    return this.http.put<MeetingApiResponse>(`${this.apiUrl}/${id}/agenda`, payload).pipe(
      map((apiMeeting) => {
        const previous = this.meetingsSubject.getValue().find((meeting) => meeting.id === id);
        const mapped = this.mapFromApi(apiMeeting);
        return {
          ...mapped,
          participants: previous?.participants ?? [],
        };
      }),
      tap((updatedMeeting) => {
        this.meetingsSubject.next(
          this.meetingsSubject.getValue().map((meeting) =>
            meeting.id === updatedMeeting.id ? { ...meeting, ...updatedMeeting } : meeting
          )
        );
      })
    );
  }

  inviteAttendees(id: number, request: InviteMeetingRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/invite`, request);
  }

  removeAttendee(id: number, attendeeEmail: string): Observable<Meeting> {
    return this.http.delete<MeetingApiResponse>(`${this.apiUrl}/${id}/attendees`, {
      params: { attendeeEmail: attendeeEmail.trim().toLowerCase() },
    }).pipe(
      map((apiMeeting) => this.mapFromApi(apiMeeting)),
      tap((updatedMeeting) => {
        this.meetingsSubject.next(
          this.meetingsSubject.getValue().map((meeting) =>
            meeting.id === updatedMeeting.id ? { ...meeting, ...updatedMeeting } : meeting
          )
        );
      })
    );
  }

  private toApiDateTime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }

  private mapFromApi(item: MeetingApiResponse): Meeting {
    return {
      id: item.id,
      title: item.title,
      agenda: item.agenda,
      startTime: item.startTime,
      endTime: item.endTime,
      organizerEmail: item.organizerEmail,
      meetingLink: item.meetingLink,
      googleCalendarEventId: item.googleCalendarEventId,
      syncedWithGoogleCalendar: item.syncedWithGoogleCalendar,
      status: this.mapStatus(item.status),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      participants: (item.attendees ?? []).map((attendee) => this.mapParticipant(attendee)),
      agendaItems: (item.agendaItems ?? [])
        .map((agendaItem) => this.mapAgendaItem(agendaItem))
        .sort((a, b) => a.itemOrder - b.itemOrder),
      totalAgendaDurationMinutes: item.totalAgendaDurationMinutes ?? 0,
    };
  }

  private mapAgendaItem(item: AgendaItemApiResponse): AgendaItem {
    return {
      id: item.id,
      title: item.title,
      durationMinutes: item.durationMinutes,
      description: item.description,
      itemOrder: item.itemOrder,
    };
  }

  private mapParticipant(attendee: MeetingAttendeeApiResponse): Participant {
    return {
      email: attendee.email,
      name: attendee.email.split('@')[0],
      status: this.mapParticipantStatus(attendee.status),
      responseReason: attendee.responseReason,
      invitedAt: attendee.invitedAt,
      respondedAt: attendee.respondedAt,
    };
  }

  private mapParticipantStatus(status: MeetingAttendeeApiResponse['status']): ParticipantInvitationStatus {
    const statusMap: Record<MeetingAttendeeApiResponse['status'], ParticipantInvitationStatus> = {
      PENDING: 'pending',
      ACCEPTED: 'accepted',
      DECLINED: 'declined',
    };

    return statusMap[status];
  }

  private mapStatus(status: MeetingApiResponse['status']): MeetingStatus {
    const statusMap: Record<MeetingApiResponse['status'], MeetingStatus> = {
      SCHEDULED: 'scheduled',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    };

    return statusMap[status];
  }
}
