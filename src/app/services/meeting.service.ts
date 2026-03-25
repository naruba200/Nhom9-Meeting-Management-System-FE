import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, concatMap, from, map, Observable, of, tap, toArray } from 'rxjs';
import {
  AgendaItem,
  AgendaItemApiResponse,
  AttachmentUploadSignatureRequest,
  AttachmentUploadSignatureResponse,
  ConfirmMeetingAttachmentUploadRequest,
  CreateMeetingApiRequest,
  CreateMeetingRequest,
  InviteMeetingRequest,
  MeetingAttendeeApiResponse,
  Meeting,
  MeetingAttachment,
  MeetingAttachmentApiResponse,
  MeetingApiResponse,
  MeetingStatus,
  PaginatedMeetingResponse,
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
    return this.http.get<PaginatedMeetingResponse>(this.apiUrl).pipe(
      map((response) => response.content.map((item) => this.mapFromApi(item as any))),
      tap((meetings) => this.meetingsSubject.next(meetings))
    );
  }

  getMeetingsPaginated(page: number, size: number, sortOrder: string): Observable<PaginatedMeetingResponse> {
    return this.http.get<PaginatedMeetingResponse>(this.apiUrl, {
      params: { page, size, sortOrder }
    }).pipe(
      map((response) => ({
        ...response,
        content: response.content.map((item) => this.mapFromApi(item as any))
      }))
    );
  }

  getMeetingById(id: number): Observable<Meeting> {
    return this.http.get<MeetingApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((apiMeeting) => {
        const previous = this.meetingsSubject.getValue().find((meeting) => meeting.id === id);
        const mapped = this.mapFromApi(apiMeeting);
        return {
          ...mapped,
          participants: previous?.participants ?? apiMeeting.attendees?.map((a) => this.mapParticipant(a)) ?? [],
        };
      })
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

    console.log('[MeetingService] addMeeting payload:', payload);
    console.log('[MeetingService] attendeeEmails:', payload.attendeeEmails);

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

  deleteAttachmentFromMeeting(meetingId: number, attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${meetingId}/attachments/${attachmentId}`).pipe(
      tap(() => {
        const currentMeetings = this.meetingsSubject.getValue();
        this.meetingsSubject.next(
          currentMeetings.map((meeting) => {
            if (meeting.id !== meetingId) {
              return meeting;
            }

            return {
              ...meeting,
              attachments: (meeting.attachments || []).filter((attachment) => attachment.id !== attachmentId),
            };
          })
        );
      })
    );
  }

  uploadAttachmentsToMeeting(meetingId: number, files: File[]): Observable<MeetingAttachment[]> {
    if (!files.length) {
      return of([]);
    }

    return from(files).pipe(
      concatMap((file) => this.uploadSingleAttachment(meetingId, file)),
      toArray()
    );
  }

  private uploadSingleAttachment(meetingId: number, file: File): Observable<MeetingAttachment> {
    const signaturePayload: AttachmentUploadSignatureRequest = { fileName: file.name };

    return this.http
      .post<AttachmentUploadSignatureResponse>(`${this.apiUrl}/${meetingId}/attachments/signature`, signaturePayload)
      .pipe(
        concatMap((signature) => this.uploadToCloudinary(file, signature)),
        concatMap((uploadResult) => {
          const confirmPayload: ConfirmMeetingAttachmentUploadRequest = {
            fileName: file.name,
            fileType: file.type || undefined,
            fileSizeBytes: file.size,
            cloudPublicId: uploadResult.public_id,
            secureUrl: uploadResult.secure_url,
          };

          return this.http.post<MeetingAttachmentApiResponse>(
            `${this.apiUrl}/${meetingId}/attachments/confirm`,
            confirmPayload
          );
        }),
        map((savedAttachment) => this.mapAttachment(savedAttachment))
      );
  }

  private uploadToCloudinary(
    file: File,
    signature: AttachmentUploadSignatureResponse
  ): Observable<{ secure_url: string; public_id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signature.apiKey);
    formData.append('timestamp', String(signature.timestamp));
    formData.append('signature', signature.signature);
    formData.append('folder', signature.folder);
    formData.append('public_id', signature.publicId);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`;
    return this.http.post<{ secure_url: string; public_id: string }>(uploadUrl, formData);
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
      attachments: (item.attachments ?? []).map((attachment) => this.mapAttachment(attachment)),
      totalAgendaDurationMinutes: item.totalAgendaDurationMinutes ?? 0,
    };
  }

  private mapAttachment(item: MeetingAttachmentApiResponse): MeetingAttachment {
    return {
      id: item.id,
      fileName: item.fileName,
      fileType: item.fileType,
      fileSizeBytes: item.fileSizeBytes,
      cloudUploadUrl: item.cloudUploadUrl,
      cloudPublicId: item.cloudPublicId,
      cloudUploadStatus: item.cloudUploadStatus,
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
