import { apiClient } from './client';
import type { BookingSlot, BookingRequest, BookingResponse, ApiResponse } from '../../types';

export interface IBookingProvider {
  getAvailableSlots(date: string): Promise<BookingSlot[]>;
  reserveSlot(request: BookingRequest): Promise<BookingResponse>;
}

export const bookingService = {
  async getSlots(date: string): Promise<ApiResponse<BookingSlot[]>> {
    return apiClient.get<BookingSlot[]>(`/api/booking/slots?date=${date}`);
  },

  async bookCall(request: BookingRequest): Promise<ApiResponse<BookingResponse>> {
    return apiClient.post<BookingResponse>('/api/booking/reserve', request);
  },
};
