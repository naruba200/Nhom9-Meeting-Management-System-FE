export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface InvitationItem {
  attendeeId: number;
  meetingId: number;
  meetingTitle: string;
  organizerEmail: string;
  meetingStartTime: string;
  meetingEndTime: string;
  status: InvitationStatus;
  responseReason?: string | null;
  invitedAt: string;
  respondedAt?: string | null;
}

export interface DeclineInvitationRequest {
  reason: string;
}
