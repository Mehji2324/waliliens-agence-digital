import { apiClient } from './client';
import type { ApiResponse } from '../../types';

export interface AdminBooking {
  id: string;
  bookingId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime?: string | null;
  durationMinutes: number;
  name: string;
  email: string;
  company?: string | null;
  projectScope?: string | null;
  timezone: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  googleEventId?: string | null;
  googleCalendarId?: string | null;
  meetingUrl?: string | null;
  notes?: string | null;
  cancelledAt?: string | null;
  rescheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminContactSubmission {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  budget?: string | null;
  timeline?: string | null;
  services: string[];
  message: string;
  status: 'new' | 'processed' | 'archived';
  notes?: string | null;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  upcomingCalls: number;
  todayCalls: number;
  thisWeekCalls: number;
}

export interface PaginatedResponse<T> {
  bookings?: T[];
  contacts?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardData {
  stats: AdminStats;
  upcomingBookings: AdminBooking[];
  recentContacts: AdminContactSubmission[];
}

export const adminApi = {
  login: async (credentials: { email: string; password: string; rememberMe?: boolean }): Promise<ApiResponse<{ email: string; expiresInHours: number }>> => {
    return apiClient.post('/api/admin/login', credentials);
  },

  logout: async (): Promise<ApiResponse<null>> => {
    return apiClient.post('/api/admin/logout');
  },

  getMe: async (): Promise<ApiResponse<{ email: string; role: string }>> => {
    return apiClient.get('/api/admin/me');
  },

  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    return apiClient.get('/api/admin/dashboard');
  },

  getBookings: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    date?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<AdminBooking>>> => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.date) query.set('date', params.date);

    const queryString = query.toString();
    return apiClient.get(`/api/admin/bookings${queryString ? `?${queryString}` : ''}`);
  },

  getBookingDetails: async (id: string): Promise<ApiResponse<AdminBooking>> => {
    return apiClient.get(`/api/admin/bookings/${id}`);
  },

  cancelBooking: async (id: string, reason?: string): Promise<ApiResponse<AdminBooking>> => {
    return apiClient.post(`/api/admin/bookings/${id}/cancel`, { reason });
  },

  rescheduleBooking: async (id: string, data: { newDate: string; newSlotId: string }): Promise<ApiResponse<AdminBooking>> => {
    return apiClient.post(`/api/admin/bookings/${id}/reschedule`, data);
  },

  getContacts: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<AdminContactSubmission>>> => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'all') query.set('status', params.status);

    const queryString = query.toString();
    return apiClient.get(`/api/admin/contacts${queryString ? `?${queryString}` : ''}`);
  },

  getContactDetails: async (id: string): Promise<ApiResponse<AdminContactSubmission>> => {
    return apiClient.get(`/api/admin/contacts/${id}`);
  },

  updateContactStatus: async (
    id: string,
    status: 'new' | 'processed' | 'archived',
    notes?: string
  ): Promise<ApiResponse<AdminContactSubmission>> => {
    return apiClient.patch(`/api/admin/contacts/${id}/status`, { status, notes });
  },
};
