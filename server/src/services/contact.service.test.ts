import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactService, contactSchema } from './contact.service';
import { contactsRepository } from '../repositories/contacts.repository';
import { ValidationError } from '../utils/http-errors';

describe('ContactService & contactSchema Validation', () => {
  let contactService: ContactService;

  beforeEach(() => {
    vi.clearAllMocks();
    contactService = new ContactService();
  });

  describe('contactSchema', () => {
    it('accepts valid contact payload', () => {
      const payload = {
        name: 'Neo Anderson',
        email: 'neo@matrix.io',
        company: 'Zion Systems',
        budget: '$10k - $25k',
        timeline: '1-3 months',
        services: ['full-stack', 'ai-integration'],
        message: 'We need to deploy high-throughput autonomous agents across the network.',
      };

      const result = contactSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects message shorter than 10 characters', () => {
      const payload = {
        name: 'Neo Anderson',
        email: 'neo@matrix.io',
        message: 'Too short',
      };

      const result = contactSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('message'))).toBe(true);
      }
    });

    it('rejects invalid email addresses', () => {
      const payload = {
        name: 'Neo Anderson',
        email: 'not-an-email',
        message: 'This is a sufficiently long message for the form.',
      };

      const result = contactSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true);
      }
    });

    it('rejects name shorter than 2 characters', () => {
      const payload = {
        name: 'N',
        email: 'neo@matrix.io',
        message: 'This is a sufficiently long message for the form.',
      };

      const result = contactSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('ContactService.submitBrief', () => {
    it('persists valid brief to repository', async () => {
      vi.spyOn(contactsRepository, 'create').mockResolvedValue({
        id: 'msg_123',
        name: 'Neo Anderson',
        email: 'neo@matrix.io',
        company: null,
        budget: null,
        timeline: null,
        services: [],
        message: 'Deploying new intelligent agents infrastructure.',
        status: 'new',
        receivedAt: new Date(),
        createdAt: new Date(),
      });

      const response = await contactService.submitBrief({
        name: 'Neo Anderson',
        email: 'neo@matrix.io',
        message: 'Deploying new intelligent agents infrastructure.',
      });

      expect(contactsRepository.create).toHaveBeenCalled();
      expect(response.messageId).toBeDefined();
      expect(response.receivedAt).toBe('Waliliens Terminal Queue');
    });

    it('buffers in memory fallback if database write fails', async () => {
      vi.spyOn(contactsRepository, 'create').mockRejectedValue(new Error('Connection refused'));

      const response = await contactService.submitBrief({
        name: 'Morpheus',
        email: 'morpheus@zion.org',
        message: 'The Matrix is everywhere. It is all around us.',
      });

      expect(response.messageId).toBeDefined();
      expect(contactService.getSubmissionsCount()).toBe(1);
    });

    it('throws ValidationError for invalid input', async () => {
      await expect(contactService.submitBrief({ name: '' })).rejects.toThrow(ValidationError);
    });
  });
});
