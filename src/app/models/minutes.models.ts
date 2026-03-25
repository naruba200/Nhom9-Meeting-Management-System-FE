export type MinutesStatus = 'DRAFT' | 'FINALIZED' | 'SIGNED';

export interface MinutesSignature {
  id?: number;
  signerEmail: string;
  signerName?: string;
  signedAt?: string | null;
  agreed: boolean;
  notes?: string;
  createdAt?: string;
}

export interface MinutesTask {
  id?: number;
  taskId: number;
  taskTitle: string;
  assigneeEmail: string;
  createdAt?: string;
}

export interface MeetingMinutes {
  id?: number;
  meetingId: number;
  title: string;
  location?: string;
  purpose?: string;
  attendees?: string;
  absentees?: string;
  content?: string;
  decisions?: string;
  contributions?: string;
  voting?: string;
  conclusions?: string;
  minutesCreatedAt: string;
  minutesClosedAt: string;
  status: MinutesStatus;
  signatures: MinutesSignature[];
  tasks: MinutesTask[];
  createdAt?: string;
  updatedAt?: string;
  pdfUrl?: string;
}

export interface CreateMeetingMinutesRequest {
  title: string;
  location?: string;
  purpose?: string;
  attendees?: string;
  absentees?: string;
  content?: string;
  decisions?: string;
  contributions?: string;
  voting?: string;
  conclusions?: string;
  minutesCreatedAt: string;
  minutesClosedAt: string;
  taskIds?: number[];
}

export interface UpdateMeetingMinutesRequest extends CreateMeetingMinutesRequest {}

export interface SignMeetingMinutesRequest {
  signerEmail: string;
  signerName?: string;
  agreed: boolean;
  notes?: string;
}

export interface MeetingMinutesResponse extends MeetingMinutes {}
