export interface BookingEmailData {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  company?: string;
  projectScope?: string;
  date: string;
  time: string;
  durationMinutes: number;
  timezone: string;
  meetingUrl: string;
}

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  skipped?: boolean;
  error?: string;
}

export interface EmailNotificationStatus {
  client: 'sent' | 'skipped' | 'failed';
  team: 'sent' | 'skipped' | 'failed';
}
