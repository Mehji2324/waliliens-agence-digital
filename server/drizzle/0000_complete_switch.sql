CREATE TABLE "bookings" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"booking_id" varchar(64) NOT NULL,
	"slot_id" varchar(128) NOT NULL,
	"date" varchar(50) NOT NULL,
	"start_time" varchar(50) NOT NULL,
	"end_time" varchar(50),
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"company" varchar(255),
	"project_scope" text,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"status" varchar(50) DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_booking_id_unique" UNIQUE("booking_id")
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"company" varchar(255),
	"budget" varchar(100),
	"timeline" varchar(100),
	"services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"message" text NOT NULL,
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(255) NOT NULL,
	"client" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"year" varchar(20) NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"badge" varchar(50),
	"impact_metrics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image" text NOT NULL,
	"accent_color" varchar(50) NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"award" text,
	"case_study" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"num" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"subtitle" text NOT NULL,
	"description" text NOT NULL,
	"who_for" text NOT NULL,
	"problem_solved" text NOT NULL,
	"capabilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deliverables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"icon" varchar(50) NOT NULL,
	"gradient" text NOT NULL,
	"accent_color" varchar(50) NOT NULL,
	"featured" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_booking_id_idx" ON "bookings" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_slot_date_unique_idx" ON "bookings" USING btree ("slot_id","date");--> statement-breakpoint
CREATE INDEX "bookings_slot_id_idx" ON "bookings" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "bookings_date_idx" ON "bookings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "bookings_email_idx" ON "bookings" USING btree ("email");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contact_submissions_email_idx" ON "contact_submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_submissions_status_idx" ON "contact_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_featured_idx" ON "projects" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");