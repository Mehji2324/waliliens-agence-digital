import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ContactPage } from './ContactPage';
import { contactService } from '../../services/api/contact';
import { CursorProvider } from '../../context/CursorContext';

vi.mock('../../services/api/contact', () => ({
  contactService: {
    submitBrief: vi.fn(),
  },
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <CursorProvider>
        <ContactPage />
      </CursorProvider>
    </MemoryRouter>
  );

describe('ContactPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all essential form fields and headers', () => {
    renderComponent();

    expect(screen.getByPlaceholderText(/Alex Mercer/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/alex@company\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Briefly describe what you're building/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /be contacted/i })).toBeRequired();
    expect(screen.getByRole('button', { name: /DISPATCH PROPOSAL BRIEF/i })).toBeInTheDocument();
  });

  it('does not submit when required fields are empty', async () => {
    const user = userEvent.setup();
    renderComponent();

    const submitBtn = screen.getByRole('button', { name: /DISPATCH PROPOSAL BRIEF/i });
    await user.click(submitBtn);

    expect(contactService.submitBrief).not.toHaveBeenCalled();
  });

  it('submits brief and displays success message on successful API response', async () => {
    const user = userEvent.setup();
    vi.mocked(contactService.submitBrief).mockResolvedValueOnce({
      data: {
        success: true,
        messageId: 'WL-12345',
        timestamp: new Date().toISOString(),
        receivedAt: 'Queue',
      },
      message: 'Success',
      status: 200,
    });

    renderComponent();

    const nameInput = screen.getByPlaceholderText(/Alex Mercer/i);
    const emailInput = screen.getByPlaceholderText(/alex@company\.com/i);
    const msgInput = screen.getByPlaceholderText(/Briefly describe what you're building/i);

    await user.type(nameInput, 'Alex Morgan');
    await user.type(emailInput, 'alex@acme.corp');
    await user.type(msgInput, 'We are looking for full-stack engineering and design overhaul.');

    const submitBtn = screen.getByRole('button', { name: /DISPATCH PROPOSAL BRIEF/i });
    await user.click(submitBtn);
    expect(contactService.submitBrief).not.toHaveBeenCalled();
    await user.click(screen.getByRole('checkbox', { name: /be contacted/i }));
    await user.click(submitBtn);

    await waitFor(() => {
      expect(contactService.submitBrief).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Alex Morgan',
          email: 'alex@acme.corp',
          message: 'We are looking for full-stack engineering and design overhaul.',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Brief Successfully Transmitted/i)).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    const user = userEvent.setup();
    vi.mocked(contactService.submitBrief).mockRejectedValueOnce(
      new Error('Failed to transmit message: 500 Internal Server Error')
    );

    renderComponent();

    const nameInput = screen.getByPlaceholderText(/Alex Mercer/i);
    const emailInput = screen.getByPlaceholderText(/alex@company\.com/i);
    const msgInput = screen.getByPlaceholderText(/Briefly describe what you're building/i);

    await user.type(nameInput, 'Alex Morgan');
    await user.type(emailInput, 'alex@acme.corp');
    await user.type(msgInput, 'We need an urgent project quote.');
    await user.click(screen.getByRole('checkbox', { name: /be contacted/i }));

    const submitBtn = screen.getByRole('button', { name: /DISPATCH PROPOSAL BRIEF/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Submission Notice/i)).toBeInTheDocument();
    });
  });
});
