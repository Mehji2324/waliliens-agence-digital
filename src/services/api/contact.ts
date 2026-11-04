import { apiClient } from './client';
import type { ContactRequest, ContactResponse, ApiResponse } from '../../types';

export const contactService = {
  async submitBrief(brief: ContactRequest): Promise<ApiResponse<ContactResponse>> {
    // No mock fallback: if the backend fails, the error propagates so the form
    // shows a real error message rather than silently swallowing failures.
    return apiClient.post<ContactResponse>('/api/contact', brief);
  },
};
