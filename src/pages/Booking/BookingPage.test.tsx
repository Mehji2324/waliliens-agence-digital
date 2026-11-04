import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { BookingPage } from './BookingPage';
import { bookingService } from '../../services/api/booking';
import { CursorProvider } from '../../context/CursorContext';
import type { BookingSlot } from '../../types';

vi.mock('../../services/api/booking', () => ({
  bookingService: {
    getSlots: vi.fn(),
    bookCall: vi.fn(),
  },
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

const mockSlots: BookingSlot[] = [
  {
    id: 'slot_1',
    date: '2026-10-15',
    time: '10:00',
    available: true,
  },
  {
    id: 'slot_2',
    date: '2026-10-15',
    time: '14:00',
    available: true,
  },
];

const renderComponent = () =>
  render(
    <MemoryRouter>
      <CursorProvider>
        <BookingPage />
      </CursorProvider>
    </MemoryRouter>
  );

describe('BookingPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bookingService.getSlots).mockResolvedValue({
      data: mockSlots,
      status: 200,
      message: 'OK',
    });
  });

  it('loads and displays available consultation slots', async () => {
    renderComponent();

    await waitFor(() => {
      expect(bookingService.getSlots).toHaveBeenCalled();
    });

    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('14:00')).toBeInTheDocument();
  });

  it('submits booking and displays confirmation on success', async () => {
    const user = userEvent.setup();
    vi.mocked(bookingService.bookCall).mockResolvedValueOnce({
      data: {
        success: true,
        bookingId: 'BK_CONFIRMED_99',
        scheduledTime: '2026-10-15 at 10:00 AM',
        meetingUrl: 'https://meet.google.com/test-meet-link',
        message: 'OK',
      },
      message: 'OK',
      status: 200,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Satoshi Nakamoto/i);
    const emailInput = screen.getByPlaceholderText(/satoshi@bitcoin\.org/i);

    await user.type(nameInput, 'Trinity Moss');
    await user.type(emailInput, 'trinity@zion.org');

    const submitBtn = screen.getByRole('button', { name: /CONFIRM DISCOVERY SESSION/i });
    await user.click(submitBtn);
    expect(bookingService.bookCall).not.toHaveBeenCalled();
    await user.click(screen.getByRole('checkbox', { name: /be contacted/i }));
    await user.click(submitBtn);

    await waitFor(() => {
      expect(bookingService.bookCall).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Trinity Moss',
          email: 'trinity@zion.org',
          slotId: 'slot_1',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/BK_CONFIRMED_99/i)).toBeInTheDocument();
    });
  });

  it('displays error notice when slot reservation fails', async () => {
    const user = userEvent.setup();
    vi.mocked(bookingService.bookCall).mockRejectedValueOnce(
      new Error('This time slot has already been reserved.')
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Satoshi Nakamoto/i);
    const emailInput = screen.getByPlaceholderText(/satoshi@bitcoin\.org/i);

    await user.type(nameInput, 'Trinity Moss');
    await user.type(emailInput, 'trinity@zion.org');
    await user.click(screen.getByRole('checkbox', { name: /be contacted/i }));

    const submitBtn = screen.getByRole('button', { name: /CONFIRM DISCOVERY SESSION/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/This time slot has already been reserved/i)).toBeInTheDocument();
    });
  });
});
