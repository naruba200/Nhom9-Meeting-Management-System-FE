export type NotificationType =
  | 'MEETING_INVITATION'
  | 'MEETING_INVITATION_DECLINED'
  | 'MEETING_UPDATED'
  | 'MEETING_CANCELLED'
  | 'MEETING_STARTING_SOON';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  meetingId?: number;
  createdAt: string;
}
