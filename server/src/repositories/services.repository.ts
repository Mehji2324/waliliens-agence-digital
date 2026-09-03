import { eq } from 'drizzle-orm';
import { db } from '../db';
import { servicesTable, type InsertService, type SelectService } from '../db/schema';
import type { Service } from '../types/domain';

export class ServicesRepository {
  public async findAll(): Promise<Service[]> {
    const rows = await db.select().from(servicesTable);
    return rows.map((row) => this.mapToDomain(row));
  }

  public async findById(id: string): Promise<Service | null> {
    const rows = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToDomain(rows[0]);
  }

  public async findBySlug(slug: string): Promise<Service | null> {
    const rows = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.slug, slug))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToDomain(rows[0]);
  }

  public async upsert(data: InsertService): Promise<void> {
    await db
      .insert(servicesTable)
      .values(data)
      .onConflictDoUpdate({
        target: servicesTable.id,
        set: {
          slug: data.slug,
          num: data.num,
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          whoFor: data.whoFor,
          problemSolved: data.problemSolved,
          capabilities: data.capabilities,
          deliverables: data.deliverables,
          icon: data.icon,
          gradient: data.gradient,
          accentColor: data.accentColor,
          featured: data.featured,
          updatedAt: new Date(),
        },
      });
  }

  public async count(): Promise<number> {
    const rows = await db.select().from(servicesTable);
    return rows.length;
  }

  private mapToDomain(row: SelectService): Service {
    return {
      id: row.id,
      num: row.num,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      whoFor: row.whoFor,
      problemSolved: row.problemSolved,
      capabilities: row.capabilities || [],
      deliverables: row.deliverables || [],
      icon: row.icon,
      gradient: row.gradient,
      accentColor: row.accentColor,
    };
  }
}

export const servicesRepository = new ServicesRepository();
