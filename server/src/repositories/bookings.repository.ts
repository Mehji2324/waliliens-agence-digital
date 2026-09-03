import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { bookingsTable, type InsertBooking, type SelectBooking } from '../db/schema';
import { ConflictError } from '../utils/http-errors';

export class BookingsRepository {
  public async getActiveBookingsByDate(date: string): Promise<SelectBooking[]> {
    return db
      .select()
      .from(bookingsTable)
      .where(and(eq(bookingsTable.date, date), eq(bookingsTable.status, 'confirmed')));
  }

  public async findBySlotAndDate(slotId: string, date: string): Promise<SelectBooking | null> {
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
  }

  public async findByBookingId(bookingId: string): Promise<SelectBooking | null> {
    const rows = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.bookingId, bookingId))
      .limit(1);

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Atomically creates a booking.
   * Leverages database unique index on (slot_id, date) to prevent race conditions.
   */
  public async createBooking(data: InsertBooking): Promise<SelectBooking> {
    try {
      const rows = await db
        .insert(bookingsTable)
        .values(data)
        .returning();

      return rows[0];
    } catch (err: unknown) {
      // Check for PostgreSQL unique constraint violation (code 23505)
      const errorObj = err as { code?: string; detail?: string; message?: string };
      if (errorObj.code === '23505' || errorObj.message?.includes('unique') || errorObj.message?.includes('duplicate')) {
        throw new ConflictError(`This time slot (${data.date} at ${data.startTime}) has already been reserved.`);
      }
      throw err;
    }
  }

  public async count(): Promise<number> {
    const rows = await db.select().from(bookingsTable);
    return rows.length;
  }
}

export const bookingsRepository = new BookingsRepository();
