import { google, calendar_v3 } from 'googleapis';
import { env } from '../../config/env';

let cachedCalendar: calendar_v3.Calendar | null = null;
let cachedAuthClient: InstanceType<typeof google.auth.OAuth2> | null = null;

export class GoogleCalendarClientFactory {
  public static isConfigured(): boolean {
    return (
      env.googleCalendar.enabled &&
      Boolean(
        env.googleCalendar.clientId &&
        env.googleCalendar.clientSecret &&
        env.googleCalendar.refreshToken
      )
    );
  }

  public static getOAuth2Client(): InstanceType<typeof google.auth.OAuth2> {
    if (!cachedAuthClient) {
      if (!this.isConfigured()) {
        throw new Error('Google Calendar credentials are not configured.');
      }

      cachedAuthClient = new google.auth.OAuth2(
        env.googleCalendar.clientId,
        env.googleCalendar.clientSecret,
        'https://developers.google.com/oauthplayground'
      );

      cachedAuthClient.setCredentials({
        refresh_token: env.googleCalendar.refreshToken,
      });
    }

    return cachedAuthClient;
  }

  public static getCalendarClient(): calendar_v3.Calendar {
    if (!cachedCalendar) {
      const auth = this.getOAuth2Client();
      cachedCalendar = google.calendar({ version: 'v3', auth });
    }
    return cachedCalendar;
  }

  /**
   * Clears cached clients (useful for testing and config reloading).
   */
  public static reset(): void {
    cachedCalendar = null;
    cachedAuthClient = null;
  }
}
