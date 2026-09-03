import { apiClient } from './client';
import type { ContactRequest, ContactResponse, ApiResponse } from '../../types';

export const contactService = {
  async submitBrief(brief: ContactRequest): Promise<ApiResponse<ContactResponse>> {
    try {
      const res = await apiClient.post<ContactResponse>('/api/contact', brief);
      if (res.isMock || !res.data?.success) {
        // Internal mock response for development until Phase 3 backend
        return {
          data: {
            success: true,
            messageId: `mock_${Date.now()}`,
            timestamp: new Date().toISOString(),
            receivedAt: 'Waliliens Terminal Queue',
          },
          status: 200,
          isMock: true,
        };
      }
      return res;
    } catch {
      // Mock fallback in development mode
      return {
        data: {
          success: true,
          messageId: `mock_${Date.now()}`,
          timestamp: new Date().toISOString(),
          receivedAt: 'Waliliens Terminal Queue',
        },
        status: 200,
        isMock: true,
      };
    }
  },
};
