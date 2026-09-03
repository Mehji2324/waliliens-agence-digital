export interface TimeInterval {
  start: string; // ISO 8601
  end: string;   // ISO 8601
}

export interface GoogleFreeBusyResponse {
  timeMin: string;
  timeMax: string;
  calendars: Record<
    string,
    {
      busy: { start: string; end: string }[];
      errors?: { domain: string; reason: string }[];
    }
  >;
}

export interface GoogleCalendarEventRequest {
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
  timeZone: string;
  attendeeEmail: string;
  attendeeName: string;
  bookingId: string;
}

export interface GoogleCalendarEventResult {
  eventId: string;
  calendarId: string;
  meetingUrl: string;
  status: string;
  htmlLink?: string;
  startIso: string;
  endIso: string;
}

export interface GeneratedSlot {
  slotId: string;
  date: string;
  time: string; // e.g., '10:00 AM'
  startTimeIso: string;
  endTimeIso: string;
  durationMinutes: number;
  available: boolean;
}
