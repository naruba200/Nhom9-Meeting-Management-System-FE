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

export interface MeetingAttachment {
  id?: number;
  fileName: string;
  fileType?: string | null;
  fileSizeBytes: number;
  cloudUploadUrl?: string | null;
  cloudPublicId?: string | null;
  cloudUploadStatus?: string;
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
  attachments: MeetingAttachment[];
}

/**
 * Kiểm tra xem cuộc họp có đang diễn ra hay không
 */
export function isMeetingOngoing(meeting: Meeting): boolean {
  const now = new Date();
  const start = new Date(meeting.startTime);
  const end = new Date(meeting.endTime);
  return now >= start && now <= end;
}

/**
 * Kiểm tra xem cuộc họp đã kết thúc chưa
 */
export function isMeetingEnded(meeting: Meeting): boolean {
  const now = new Date();
  const end = new Date(meeting.endTime);
  return now > end;
}

/**
 * Kiểm tra xem cuộc họp đã kết thúc trong vòng 24 giờ qua chưa
 * Trả về số giờ còn lại trước khi chuyển sang lịch sử (sau 24h kể từ khi kết thúc)
 */
export function getHoursUntilHistory(meeting: Meeting): number {
  const now = new Date();
  const end = new Date(meeting.endTime);
  const historyThreshold = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  
  if (now >= historyThreshold) {
    return 0; // Đã chuyển sang lịch sử
  }
  
  const diffMs = historyThreshold.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60)); // Số giờ còn lại
}

/**
 * Kiểm tra xem cuộc họp có trong trạng thái "sắp chuyển sang lịch sử" không (trong vòng 24h sau khi kết thúc)
 */
export function isMeetingPendingHistory(meeting: Meeting): boolean {
  if (meeting.status !== 'completed') {
    return false;
  }
  const hoursUntil = getHoursUntilHistory(meeting);
  return hoursUntil > 0;
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

export interface AttachmentUploadSignatureRequest {
  fileName: string;
}

export interface AttachmentUploadSignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  resourceType: string;
}

export interface ConfirmMeetingAttachmentUploadRequest {
  fileName: string;
  fileType?: string;
  fileSizeBytes: number;
  cloudPublicId: string;
  secureUrl: string;
}

export interface InviteMeetingRequest {
  attendeeEmails: string[];
}

export interface PaginatedMeetingResponse {
  content: Meeting[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
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
  attachments?: MeetingAttachmentApiResponse[];
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

export interface MeetingAttachmentApiResponse {
  id: number;
  fileName: string;
  fileType?: string | null;
  fileSizeBytes: number;
  cloudUploadUrl?: string | null;
  cloudPublicId?: string | null;
  cloudUploadStatus?: string;
}
