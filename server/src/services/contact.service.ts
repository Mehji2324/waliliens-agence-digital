import { z } from 'zod';
import { randomUUID } from 'crypto';
import type { ContactRequest, ContactRecord } from '../types/domain';
import { ValidationError } from '../utils/http-errors';
import { contactsRepository } from '../repositories/contacts.repository';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  email: z
    .string()
    .trim()
    .email({ message: 'A valid email address is required' })
    .max(255, { message: 'Email cannot exceed 255 characters' }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Project brief / message must be at least 10 characters' })
    .max(3000, { message: 'Message cannot exceed 3000 characters' }),
  company: z.string().trim().max(100).optional(),
  budget: z.string().trim().max(50).optional().default('Not specified'),
  timeline: z.string().trim().max(50).optional().default('Not specified'),
  services: z.array(z.string()).optional().default([]),
});

export class ContactService {
  // In-memory buffer fallback for development when database is unavailable
  private readonly fallbackSubmissions: ContactRecord[] = [];

  public async submitBrief(rawInput: unknown): Promise<{
    messageId: string;
    timestamp: string;
    receivedAt: string;
  }> {
    const parseResult = contactSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parseResult.error.issues) {
        const pathKey = issue.path.join('.') || 'body';
        if (!details[pathKey]) details[pathKey] = [];
        details[pathKey].push(issue.message);
      }
      throw new ValidationError('Contact validation failed.', details);
    }

    const validated: ContactRequest = parseResult.data;
    const messageId = `msg_${randomUUID()}`;
    const timestamp = new Date().toISOString();

    try {
      // Persist to PostgreSQL database
      await contactsRepository.create({
        id: messageId,
        name: validated.name,
        email: validated.email,
        company: validated.company || null,
        budget: validated.budget || null,
        timeline: validated.timeline || null,
        services: validated.services || [],
        message: validated.message,
        status: 'new',
        receivedAt: new Date(),
        createdAt: new Date(),
      });
      console.log(`[ContactService] Persisted brief [${messageId}] to database for ${validated.name} (${validated.email})`);
    } catch (dbErr) {
      console.warn('[ContactService] Database unavailable, buffered in memory fallback:', dbErr instanceof Error ? dbErr.message : dbErr);
      this.fallbackSubmissions.push({
        ...validated,
        id: messageId,
        receivedAt: timestamp,
      });
    }

    return {
      messageId,
      timestamp,
      receivedAt: 'Waliliens Terminal Queue',
    };
  }

  public getSubmissionsCount(): number {
    return this.fallbackSubmissions.length;
  }
}

export const contactService = new ContactService();
