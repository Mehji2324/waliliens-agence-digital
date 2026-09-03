import { db } from '../db';
import { contactSubmissionsTable, type InsertContactSubmission, type SelectContactSubmission } from '../db/schema';

export class ContactsRepository {
  public async create(data: InsertContactSubmission): Promise<SelectContactSubmission> {
    const rows = await db
      .insert(contactSubmissionsTable)
      .values(data)
      .returning();

    return rows[0];
  }

  public async findAll(): Promise<SelectContactSubmission[]> {
    return db.select().from(contactSubmissionsTable);
  }

  public async count(): Promise<number> {
    const rows = await db.select().from(contactSubmissionsTable);
    return rows.length;
  }
}

export const contactsRepository = new ContactsRepository();
