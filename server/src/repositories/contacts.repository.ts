import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { contactSubmissionsTable, type InsertContactSubmission, type SelectContactSubmission } from '../db/schema';

export interface ContactFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface PaginatedContactsResult {
  contacts: SelectContactSubmission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ContactsRepository {
  private readonly fallbackContacts: SelectContactSubmission[] = [];

  public async create(data: InsertContactSubmission): Promise<SelectContactSubmission> {
    try {
      const rows = await db
        .insert(contactSubmissionsTable)
        .values(data)
        .returning();

      return rows[0];
    } catch {
      const newRecord: SelectContactSubmission = {
        ...data,
        id: data.id,
        name: data.name,
        email: data.email,
        company: data.company || null,
        budget: data.budget || null,
        timeline: data.timeline || null,
        services: data.services || [],
        message: data.message,
        status: data.status || 'new',
        notes: data.notes || null,
        receivedAt: data.receivedAt || new Date(),
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
      };
      this.fallbackContacts.unshift(newRecord);
      return newRecord;
    }
  }

  public async findById(id: string): Promise<SelectContactSubmission | null> {
    try {
      const rows = await db
        .select()
        .from(contactSubmissionsTable)
        .where(eq(contactSubmissionsTable.id, id))
        .limit(1);

      return rows.length > 0 ? rows[0] : null;
    } catch {
      const found = this.fallbackContacts.find((c) => c.id === id);
      return found || null;
    }
  }

  public async updateStatus(
    id: string,
    status: 'new' | 'processed' | 'archived',
    notes?: string
  ): Promise<SelectContactSubmission | null> {
    const updatedAt = new Date();
    try {
      const rows = await db
        .update(contactSubmissionsTable)
        .set({
          status,
          updatedAt,
          ...(notes !== undefined ? { notes } : {}),
        })
        .where(eq(contactSubmissionsTable.id, id))
        .returning();

      return rows[0] || null;
    } catch {
      const index = this.fallbackContacts.findIndex((c) => c.id === id);
      if (index !== -1) {
        this.fallbackContacts[index] = {
          ...this.fallbackContacts[index],
          status,
          updatedAt,
          ...(notes !== undefined ? { notes } : {}),
        };
        return this.fallbackContacts[index];
      }
      return null;
    }
  }

  public async findAllPaginated(options: ContactFilterOptions = {}): Promise<PaginatedContactsResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 15));
    const offset = (page - 1) * limit;

    try {
      const conditions = [];

      if (options.status && options.status !== 'all') {
        conditions.push(eq(contactSubmissionsTable.status, options.status));
      }

      if (options.search && options.search.trim()) {
        const pattern = `%${options.search.trim()}%`;
        conditions.push(
          or(
            ilike(contactSubmissionsTable.name, pattern),
            ilike(contactSubmissionsTable.email, pattern),
            ilike(contactSubmissionsTable.company, pattern),
            ilike(contactSubmissionsTable.message, pattern)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const countRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(contactSubmissionsTable)
        .where(whereClause);

      const total = Number(countRes[0]?.count || 0);

      const rows = await db
        .select()
        .from(contactSubmissionsTable)
        .where(whereClause)
        .orderBy(desc(contactSubmissionsTable.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        contacts: rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch {
      let list = [...this.fallbackContacts];
      if (options.status && options.status !== 'all') {
        list = list.filter((c) => c.status === options.status);
      }
      if (options.search && options.search.trim()) {
        const q = options.search.trim().toLowerCase();
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.company && c.company.toLowerCase().includes(q)) ||
            c.message.toLowerCase().includes(q)
        );
      }

      const total = list.length;
      const paginated = list.slice(offset, offset + limit);

      return {
        contacts: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  }

  public async findAll(): Promise<SelectContactSubmission[]> {
    const res = await this.findAllPaginated({ limit: 1000 });
    return res.contacts;
  }

  public async count(): Promise<number> {
    const res = await this.findAllPaginated({ limit: 1 });
    return res.total;
  }
}

export const contactsRepository = new ContactsRepository();
