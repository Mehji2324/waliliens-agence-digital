# Google Calendar & Google Meet Integration Setup Guide

This guide walks through configuring real-time Google Calendar scheduling with automatic Google Meet video conference creation for the Waliliens studio booking engine.

---

## 1. Create a Google Cloud Project

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **`Waliliens Studio`** (or select an existing project).
3. Ensure the project is selected in the top navigation bar.

---

## 2. Enable Google Calendar API

1. Go to **APIs & Services > Library**.
2. Search for **Google Calendar API**.
3. Click **Enable**.

---

## 3. Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**.
2. Select **User Type: External** (or Internal for Google Workspace).
3. Fill in:
   - **App name:** `Waliliens Studio`
   - **User support email:** your work email
   - **Developer contact information:** your work email
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes** and select:
   - `https://www.googleapis.com/auth/calendar` (or `https://www.googleapis.com/auth/calendar.events`)
6. Under **Test Users**, add the Google email address that owns the calendar you will connect.
7. Click **Save and Continue**.

---

## 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Select **Application type: Web application**.
4. Set **Name:** `Waliliens Backend Client`.
5. Under **Authorized redirect URIs**, add:
   - `https://developers.google.com/oauthplayground`
6. Click **Create**.
7. Copy the **Client ID** and **Client Secret**.

---

## 5. Obtain the Refresh Token

1. Open the [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Click the **gear icon (⚙)** in the top right:
   - Check **"Use your own OAuth credentials"**.
   - Paste your **OAuth Client ID**.
   - Paste your **OAuth Client Secret**.
3. In **Step 1 (Select & authorize APIs)** on the left:
   - Scroll down to **Google Calendar API v3**.
   - Select `https://www.googleapis.com/auth/calendar.events` and `https://www.googleapis.com/auth/calendar`.
   - Click **Authorize APIs**.
4. Log in with your calendar owner Google account and grant permissions.
5. In **Step 2 (Exchange authorization code for tokens)**:
   - Click **Exchange authorization code for tokens**.
   - Copy the generated **Refresh token**.

---

## 6. Configure Environment Variables

Create or update your `.env` in `server/`:

```env
# Google Calendar Integration
GOOGLE_CALENDAR_ENABLED=true
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_CALENDAR_ID=primary

# Booking Rules & Working Hours
BOOKING_DURATION_MINUTES=30
BOOKING_TIMEZONE=Africa/Casablanca
BOOKING_START_HOUR=10
BOOKING_END_HOUR=18
BOOKING_MIN_NOTICE_MINUTES=120
```

> **Note:**
> - `GOOGLE_CALENDAR_ID`: Set to `primary` for the default user calendar, or use a specific calendar ID (e.g., `c_xxxxxxxx@group.calendar.google.com`).
> - `BOOKING_TIMEZONE`: Use standard IANA timezone identifiers (e.g. `Africa/Casablanca`, `Europe/London`, `America/New_York`, `UTC`).

---

## 7. How the Booking Flow Works

1. **Availability Query (`GET /api/booking/slots?date=YYYY-MM-DD`)**:
   - Generates candidate 30-minute consultation slots within working hours (`10:00` to `18:00`).
   - Queries Google Calendar's **FreeBusy API** for busy intervals on that day.
   - Queries the local PostgreSQL `bookings` table for active reservations.
   - Filters out past slots and slots within the minimum notice window (`120` minutes).
   - Returns only genuinely available slots.

2. **Slot Reservation (`POST /api/booking/reserve`)**:
   - Validates client payload.
   - Re-checks live Google Calendar and DB availability.
   - Calls Google Calendar API to insert the event with conference data (`hangoutsMeet`).
   - Extracts authentic Google Meet link (`https://meet.google.com/...`).
   - Atomically records the booking in PostgreSQL with composite unique constraint `(slot_id, date)`.
   - Returns confirmed booking payload with Google Meet link.
   - If a database conflict occurs (e.g. concurrent race condition), automatically rolls back and deletes the created Google Calendar event.

---

## 8. Running and Testing

```bash
# Run backend development server
npm run server:dev

# Run automated integration tests with mock Google API
npm test --prefix server

# Run database migration
npm run db:migrate --prefix server
```
