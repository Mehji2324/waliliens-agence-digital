import { eq } from 'drizzle-orm';
import { db } from '../db';
import { projectsTable, type InsertProject, type SelectProject } from '../db/schema';
import type { Project } from '../types/domain';

export class ProjectsRepository {
  public async findAll(): Promise<Project[]> {
    const rows = await db.select().from(projectsTable);
    return rows.map((row) => this.mapToDomain(row));
  }

  public async findById(id: string): Promise<Project | null> {
    const rows = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToDomain(rows[0]);
  }

  public async findBySlug(slug: string): Promise<Project | null> {
    const rows = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.slug, slug))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToDomain(rows[0]);
  }

  public async upsert(data: InsertProject): Promise<void> {
    await db
      .insert(projectsTable)
      .values(data)
      .onConflictDoUpdate({
        target: projectsTable.id,
        set: {
          slug: data.slug,
          title: data.title,
          client: data.client,
          category: data.category,
          year: data.year,
          tagline: data.tagline,
          description: data.description,
          badge: data.badge,
          impactMetrics: data.impactMetrics,
          technologies: data.technologies,
          image: data.image,
          accentColor: data.accentColor,
          featured: data.featured,
          award: data.award,
          caseStudy: data.caseStudy,
          updatedAt: new Date(),
        },
      });
  }

  public async count(): Promise<number> {
    const rows = await db.select().from(projectsTable);
    return rows.length;
  }

  private mapToDomain(row: SelectProject): Project {
    return {
      id: row.id,
      title: row.title,
      client: row.client,
      category: row.category as Project['category'],
      year: row.year,
      tagline: row.tagline,
      description: row.description,
      badge: (row.badge as Project['badge']) || undefined,
      impactMetrics: row.impactMetrics || [],
      technologies: row.technologies || [],
      image: row.image,
      accentColor: row.accentColor,
      featured: row.featured,
      award: row.award || undefined,
      caseStudy: row.caseStudy,
    };
  }
}

export const projectsRepository = new ProjectsRepository();
