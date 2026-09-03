ALTER TABLE "bookings" ADD COLUMN "google_event_id" varchar(255);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "google_calendar_id" varchar(255);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "meeting_url" text;--> statement-breakpoint
CREATE INDEX "bookings_google_event_idx" ON "bookings" USING btree ("google_event_id");