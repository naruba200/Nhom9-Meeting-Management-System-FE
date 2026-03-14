export interface Participant {
  email: string;
  name?: string;
  avatar?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: Participant[];
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: Date;
  creatorEmail: string;
}

export interface CreateMeetingRequest {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  participantEmails: string[];
}
