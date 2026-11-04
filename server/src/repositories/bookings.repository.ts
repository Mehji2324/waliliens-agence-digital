import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { bookingsTable, type InsertBooking, type SelectBooking } from '../db/schema';
import { ConflictError } from '../utils/http-errors';
import { env, getTodayDateString } from '../config/env';

export interface BookingFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  date?: string;
  sortBy?: 'date' | 'createdAt' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedBookingsResult {
  bookings: SelectBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminBookingStats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  upcomingCalls: number;
  todayCalls: number;
  thisWeekCalls: number;
}

export class BookingsRepository {
  // In-memory fallback buffer for development when DB is offline
  private readonly fallbackBookings: SelectBooking[] = [];

  public async getActiveBookingsByDate(date: string): Promise<SelectBooking[]> {
    try {
      return await db
        .select()
        .from(bookingsTable)
        .where(and(eq(bookingsTable.date, date), eq(bookingsTable.status, 'confirmed')));
    } catch {
      return this.fallbackBookings.filter(
        (b) => b.date === date && b.status === 'confirmed'
      );
    }
  }

  public async findBySlotAndDate(slotId: string, date: string): Promise<SelectBooking | null> {
    try {
      const rows = await db
        .select()
        .from(bookingsTable)
        .where(
          and(
            eq(bookingsTable.slotId, slotId),
            eq(bookingsTable.date, date),
            eq(bookingsTable.status, 'confirmed')
          )
        )
        .limit(1);

      return rows.length > 0 ? rows[0] : null;
    } catch {
      const found = this.fallbackBookings.find(
        (b) => b.slotId === slotId && b.date === date && b.status === 'confirmed'
      );
      return found || null;
    }
  }

  public async findByIdOrBookingId(identifier: string): Promise<SelectBooking | null> {
    try {
      const rows = await db
        .select()
        .from(bookingsTable)
        .where(
          or(
            eq(bookingsTable.id, identifier),
            eq(bookingsTable.bookingId, identifier)
          )
        )
        .limit(1);

      return rows.length > 0 ? rows[0] : null;
    } catch {
      const found = this.fallbackBookings.find(
        (b) => b.id === identifier || b.bookingId === identifier
      );
      return found || null;
    }
  }

  public async findByBookingId(bookingId: string): Promise<SelectBooking | null> {
    return this.findByIdOrBookingId(bookingId);
  }

  public async createBooking(data: InsertBooking): Promise<SelectBooking> {
    try {
      const rows = await db
        .insert(bookingsTable)
        .values(data)
        .returning();

      return rows[0];
    } catch (err: unknown) {
      const errorObj = err as { code?: string; detail?: string; message?: string };
      if (
        errorObj.code === '23505' ||
        errorObj.message?.includes('unique') ||
        errorObj.message?.includes('duplicate')
      ) {
        throw new ConflictError(`This time slot (${data.date} at ${data.startTime}) has already been reserved.`);
      }

      // If DB is offline, add to fallback buffer
      const newRecord: SelectBooking = {
        ...data,
        id: data.id,
        bookingId: data.bookingId,
        slotId: data.slotId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime || null,
        durationMinutes: data.durationMinutes || 30,
        name: data.name,
        email: data.email,
        company: data.company || null,
        projectScope: data.projectScope || null,
        timezone: data.timezone || 'UTC',
        status: data.status || 'confirmed',
        googleEventId: data.googleEventId || null,
        googleCalendarId: data.googleCalendarId || null,
        meetingUrl: data.meetingUrl || null,
        notes: data.notes || null,
        cancelledAt: data.cancelledAt || null,
        rescheduledAt: data.rescheduledAt || null,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
      };
      this.fallbackBookings.unshift(newRecord);
      return newRecord;
    }
  }

  public async updateBookingStatus(
    id: string,
    status: 'confirmed' | 'cancelled' | 'completed',
    options?: { notes?: string; cancelledAt?: Date; rescheduledAt?: Date }
  ): Promise<SelectBooking | null> {
    const updatedAt = new Date();
    try {
      const updateData: Partial<InsertBooking> = {
        status,
        updatedAt,
        ...(options?.notes !== undefined ? { notes: options.notes } : {}),
        ...(options?.cancelledAt !== undefined ? { cancelledAt: options.cancelledAt } : {}),
        ...(options?.rescheduledAt !== undefined ? { rescheduledAt: options.rescheduledAt } : {}),
      };

      const rows = await db
        .update(bookingsTable)
        .set(updateData)
        .where(or(eq(bookingsTable.id, id), eq(bookingsTable.bookingId, id)))
        .returning();

      return rows[0] || null;
    } catch {
      const index = this.fallbackBookings.findIndex(
        (b) => b.id === id || b.bookingId === id
      );
      if (index !== -1) {
        this.fallbackBookings[index] = {
          ...this.fallbackBookings[index],
          status,
          updatedAt,
          ...(options?.notes !== undefined ? { notes: options.notes } : {}),
          ...(options?.cancelledAt !== undefined ? { cancelledAt: options.cancelledAt } : {}),
          ...(options?.rescheduledAt !== undefined ? { rescheduledAt: options.rescheduledAt } : {}),
        };
        return this.fallbackBookings[index];
      }
      return null;
    }
  }

  public async rescheduleBooking(
    id: string,
    params: {
      slotId: string;
      date: string;
      startTime: string;
      endTime: string;
      meetingUrl?: string;
      googleEventId?: string;
      notes?: string;
    }
  ): Promise<SelectBooking | null> {
    const updatedAt = new Date();
    const rescheduledAt = new Date();

    try {
      const rows = await db
        .update(bookingsTable)
        .set({
          slotId: params.slotId,
          date: params.date,
          startTime: params.startTime,
          endTime: params.endTime,
          status: 'confirmed',
          ...(params.meetingUrl ? { meetingUrl: params.meetingUrl } : {}),
          ...(params.googleEventId ? { googleEventId: params.googleEventId } : {}),
          ...(params.notes ? { notes: params.notes } : {}),
          rescheduledAt,
          updatedAt,
        })
        .where(or(eq(bookingsTable.id, id), eq(bookingsTable.bookingId, id)))
        .returning();

      return rows[0] || null;
    } catch {
      const index = this.fallbackBookings.findIndex(
        (b) => b.id === id || b.bookingId === id
      );
      if (index !== -1) {
        this.fallbackBookings[index] = {
          ...this.fallbackBookings[index],
          slotId: params.slotId,
          date: params.date,
          startTime: params.startTime,
          endTime: params.endTime,
          status: 'confirmed',
          ...(params.meetingUrl ? { meetingUrl: params.meetingUrl } : {}),
          ...(params.googleEventId ? { googleEventId: params.googleEventId } : {}),
          ...(params.notes ? { notes: params.notes } : {}),
          rescheduledAt,
          updatedAt,
        };
        return this.fallbackBookings[index];
      }
      return null;
    }
  }

  public async findAllPaginated(options: BookingFilterOptions = {}): Promise<PaginatedBookingsResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 15));
    const offset = (page - 1) * limit;

    try {
      const conditions = [];

      if (options.status && options.status !== 'all') {
        conditions.push(eq(bookingsTable.status, options.status));
      }

      if (options.date) {
        conditions.push(eq(bookingsTable.date, options.date));
      }

      if (options.search && options.search.trim()) {
        const searchPattern = `%${options.search.trim()}%`;
        conditions.push(
          or(
            ilike(bookingsTable.name, searchPattern),
            ilike(bookingsTable.email, searchPattern),
            ilike(bookingsTable.company, searchPattern),
            ilike(bookingsTable.bookingId, searchPattern)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(bookingsTable)
        .where(whereClause);

      const total = Number(totalResult[0]?.count || 0);

      const rows = await db
        .select()
        .from(bookingsTable)
        .where(whereClause)
        .orderBy(desc(bookingsTable.date), desc(bookingsTable.startTime))
        .limit(limit)
        .offset(offset);

      return {
        bookings: rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch {
      // Memory fallback filtering
      let list = [...this.fallbackBookings];
      if (options.status && options.status !== 'all') {
        list = list.filter((b) => b.status === options.status);
      }
      if (options.date) {
        list = list.filter((b) => b.date === options.date);
      }
      if (options.search && options.search.trim()) {
        const q = options.search.trim().toLowerCase();
        list = list.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.email.toLowerCase().includes(q) ||
            (b.company && b.company.toLowerCase().includes(q)) ||
            b.bookingId.toLowerCase().includes(q)
        );
      }

      const total = list.length;
      const paginated = list.slice(offset, offset + limit);

      return {
        bookings: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  }

  public async getAdminStats(): Promise<AdminBookingStats> {
    const todayStr = getTodayDateString(env.booking.timezone);
    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    const nextWeekStr = getTodayDateString(env.booking.timezone, nextWeekDate);

    try {
      const [result] = await db
        .select({
          totalBookings: sql<number>`count(*)`,
          confirmedBookings: sql<number>`count(*) filter (where ${bookingsTable.status} = 'confirmed')`,
          cancelledBookings: sql<number>`count(*) filter (where ${bookingsTable.status} = 'cancelled')`,
          completedBookings: sql<number>`count(*) filter (where ${bookingsTable.status} = 'completed')`,
          upcomingCalls: sql<number>`count(*) filter (where ${bookingsTable.status} = 'confirmed' and ${bookingsTable.date} >= ${todayStr})`,
          todayCalls: sql<number>`count(*) filter (where ${bookingsTable.status} = 'confirmed' and ${bookingsTable.date} = ${todayStr})`,
          thisWeekCalls: sql<number>`count(*) filter (where ${bookingsTable.status} = 'confirmed' and ${bookingsTable.date} >= ${todayStr} and ${bookingsTable.date} <= ${nextWeekStr})`,
        })
        .from(bookingsTable);

      return {
        totalBookings: Number(result?.totalBookings || 0),
        confirmedBookings: Number(result?.confirmedBookings || 0),
        cancelledBookings: Number(result?.cancelledBookings || 0),
        completedBookings: Number(result?.completedBookings || 0),
        upcomingCalls: Number(result?.upcomingCalls || 0),
        todayCalls: Number(result?.todayCalls || 0),
        thisWeekCalls: Number(result?.thisWeekCalls || 0),
      };
    } catch {
      const allRows = this.fallbackBookings;
      return {
        totalBookings: allRows.length,
        confirmedBookings: allRows.filter((b) => b.status === 'confirmed').length,
        cancelledBookings: allRows.filter((b) => b.status === 'cancelled').length,
        completedBookings: allRows.filter((b) => b.status === 'completed').length,
        upcomingCalls: allRows.filter(
          (b) => b.status === 'confirmed' && b.date >= todayStr
        ).length,
        todayCalls: allRows.filter(
          (b) => b.status === 'confirmed' && b.date === todayStr
        ).length,
        thisWeekCalls: allRows.filter(
          (b) => b.status === 'confirmed' && b.date >= todayStr && b.date <= nextWeekStr
        ).length,
      };
    }
  }

  public async count(): Promise<number> {
    const stats = await this.getAdminStats();
    return stats.totalBookings;
  }
}

export const bookingsRepository = new BookingsRepository();
