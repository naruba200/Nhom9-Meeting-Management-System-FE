export interface Participant {
  email: string;
  name?: string;
  avatar?: string;
  status?: ParticipantInvitationStatus;
  responseReason?: string | null;
  invitedAt?: string;
  respondedAt?: string | null;
}

export interface AgendaItem {
  id?: number;
  title: string;
  durationMinutes: number;
  description?: string | null;
  itemOrder: number;
}

export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ParticipantInvitationStatus = 'pending' | 'accepted' | 'declined';

export interface Meeting {
  id: number;
  title: string;
  agenda?: string | null;
  agendaItems: AgendaItem[];
  totalAgendaDurationMinutes: number;
  startTime: string;
  endTime: string;
  participants: Participant[];
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
  organizerEmail: string;
  meetingLink?: string | null;
  googleCalendarEventId?: string | null;
  syncedWithGoogleCalendar: boolean;
}

export interface CreateMeetingRequest {
  title: string;
  agenda?: string;
  agendaItems?: AgendaItem[];
  date: string;
  startTime: string;
  endTime: string;
  participantEmails: string[];
  syncWithGoogleCalendar: boolean;
  externalMeetingLink?: string;
  timezone?: string;
}

export interface CreateMeetingApiRequest {
  title: string;
  agenda?: string;
  agendaItems?: AgendaItem[];
  startTime: string;
  endTime: string;
  syncWithGoogleCalendar: boolean;
  externalMeetingLink?: string;
  timezone?: string;
  attendeeEmails: string[];
}

export interface UpdateMeetingRequest {
  title: string;
  agenda?: string;
  agendaItems?: AgendaItem[];
  date: string;
  startTime: string;
  endTime: string;
  externalMeetingLink?: string;
  syncWithGoogleCalendar?: boolean;
  timezone?: string;
}

export interface InviteMeetingRequest {
  attendeeEmails: string[];
}

export interface MeetingApiResponse {
  id: number;
  title: string;
  agenda?: string | null;
  agendaItems?: AgendaItemApiResponse[];
  totalAgendaDurationMinutes?: number;
  startTime: string;
  endTime: string;
  organizerEmail: string;
  meetingLink?: string | null;
  googleCalendarEventId?: string | null;
  syncedWithGoogleCalendar: boolean;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  attendees?: MeetingAttendeeApiResponse[];
}

export interface MeetingAttendeeApiResponse {
  id: number;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  responseReason?: string | null;
  invitedAt: string;
  respondedAt?: string | null;
}

export interface AgendaItemApiResponse {
  id: number;
  title: string;
  durationMinutes: number;
  description?: string | null;
  itemOrder: number;
}
