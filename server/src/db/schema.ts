import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { CaseStudy, ImpactMetric } from '../types/domain';

// ─── Projects Table ──────────────────────────────────────────────────────────
export const projectsTable = pgTable(
  'projects',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    client: varchar('client', { length: 255 }).notNull(),
    category: varchar('category', { length: 100 }).notNull(),
    year: varchar('year', { length: 20 }).notNull(),
    tagline: text('tagline').notNull(),
    description: text('description').notNull(),
    badge: varchar('badge', { length: 50 }),
    impactMetrics: jsonb('impact_metrics').$type<ImpactMetric[]>().notNull().default([]),
    technologies: jsonb('technologies').$type<string[]>().notNull().default([]),
    image: text('image').notNull(),
    accentColor: varchar('accent_color', { length: 50 }).notNull(),
    featured: boolean('featured').notNull().default(false),
    award: text('award'),
    videoUrl: text('video_url'),
    demoUrl: text('demo_url'),
    caseStudy: jsonb('case_study').$type<CaseStudy>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('projects_slug_idx').on(table.slug),
    index('projects_featured_idx').on(table.featured),
    index('projects_created_at_idx').on(table.createdAt),
  ]
);

// ─── Services Table ──────────────────────────────────────────────────────────
export const servicesTable = pgTable(
  'services',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    num: varchar('num', { length: 20 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    subtitle: text('subtitle').notNull(),
    description: text('description').notNull(),
    whoFor: text('who_for').notNull(),
    problemSolved: text('problem_solved').notNull(),
    capabilities: jsonb('capabilities').$type<string[]>().notNull().default([]),
    deliverables: jsonb('deliverables').$type<string[]>().notNull().default([]),
    icon: varchar('icon', { length: 50 }).notNull(),
    gradient: text('gradient').notNull(),
    accentColor: varchar('accent_color', { length: 50 }).notNull(),
    featured: boolean('featured').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('services_slug_idx').on(table.slug),
    index('services_created_at_idx').on(table.createdAt),
  ]
);

// ─── Contact Submissions Table ───────────────────────────────────────────────
export const contactSubmissionsTable = pgTable(
  'contact_submissions',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    company: varchar('company', { length: 255 }),
    budget: varchar('budget', { length: 100 }),
    timeline: varchar('timeline', { length: 100 }),
    services: jsonb('services').$type<string[]>().notNull().default([]),
    message: text('message').notNull(),
    status: varchar('status', { length: 50 }).notNull().default('new'), // new | processed | archived
    notes: text('notes'),
    receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('contact_submissions_email_idx').on(table.email),
    index('contact_submissions_status_idx').on(table.status),
    index('contact_submissions_created_at_idx').on(table.createdAt),
  ]
);

// ─── Bookings Table ──────────────────────────────────────────────────────────
export const bookingsTable = pgTable(
  'bookings',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    bookingId: varchar('booking_id', { length: 64 }).notNull().unique(),
    slotId: varchar('slot_id', { length: 128 }).notNull(),
    date: varchar('date', { length: 50 }).notNull(),
    startTime: varchar('start_time', { length: 50 }).notNull(),
    endTime: varchar('end_time', { length: 50 }),
    durationMinutes: integer('duration_minutes').notNull().default(30),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    company: varchar('company', { length: 255 }),
    projectScope: text('project_scope'),
    timezone: varchar('timezone', { length: 50 }).notNull().default('UTC'),
    status: varchar('status', { length: 50 }).notNull().default('confirmed'), // confirmed | cancelled | completed | pending
    googleEventId: varchar('google_event_id', { length: 255 }),
    googleCalendarId: varchar('google_calendar_id', { length: 255 }),
    meetingUrl: text('meeting_url'),
    notes: text('notes'),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    rescheduledAt: timestamp('rescheduled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('bookings_booking_id_idx').on(table.bookingId),
    index('bookings_slot_id_idx').on(table.slotId),
    index('bookings_date_idx').on(table.date),
    index('bookings_email_idx').on(table.email),
    index('bookings_status_idx').on(table.status),
    index('bookings_google_event_idx').on(table.googleEventId),
    index('bookings_created_at_idx').on(table.createdAt),
  ]
);

// ─── Admin Audit Logs Table ──────────────────────────────────────────────────
export const adminAuditLogsTable = pgTable(
  'admin_audit_logs',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    action: varchar('action', { length: 100 }).notNull(), // login | logout | cancel_booking | reschedule_booking | update_contact
    targetType: varchar('target_type', { length: 50 }).notNull(), // booking | contact | auth
    targetId: varchar('target_id', { length: 128 }),
    adminEmail: varchar('admin_email', { length: 255 }).notNull(),
    details: jsonb('details').$type<Record<string, unknown>>().notNull().default({}),
    ipAddress: varchar('ip_address', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('admin_audit_logs_action_idx').on(table.action),
    index('admin_audit_logs_target_idx').on(table.targetType, table.targetId),
    index('admin_audit_logs_created_at_idx').on(table.createdAt),
  ]
);

export type InsertProject = typeof projectsTable.$inferInsert;
export type SelectProject = typeof projectsTable.$inferSelect;

export type InsertService = typeof servicesTable.$inferInsert;
export type SelectService = typeof servicesTable.$inferSelect;

export type InsertContactSubmission = typeof contactSubmissionsTable.$inferInsert;
export type SelectContactSubmission = typeof contactSubmissionsTable.$inferSelect;

export type InsertBooking = typeof bookingsTable.$inferInsert;
export type SelectBooking = typeof bookingsTable.$inferSelect;

export type InsertAdminAuditLog = typeof adminAuditLogsTable.$inferInsert;
export type SelectAdminAuditLog = typeof adminAuditLogsTable.$inferSelect;
