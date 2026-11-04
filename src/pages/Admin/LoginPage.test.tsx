import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminLoginPage } from './LoginPage';
import * as AdminAuthContext from '../../context/AdminAuthContext';
import { CursorProvider } from '../../context/CursorContext';

describe('AdminLoginPage Component & Redirect Logic', () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupAuth = (isAuthenticated: boolean, isLoading = false) => {
    vi.spyOn(AdminAuthContext, 'useAdminAuth').mockReturnValue({
      isAuthenticated,
      isLoading,
      adminEmail: isAuthenticated ? 'admin@waliliens.com' : null,
      login: mockLogin,
      logout: mockLogout,
      checkAuth: vi.fn().mockResolvedValue(isAuthenticated),
    });
  };

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <CursorProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<div>Admin Dashboard Landed</div>} />
          </Routes>
        </CursorProvider>
      </MemoryRouter>
    );

  it('renders login form when unauthenticated', () => {
    setupAuth(false);
    renderComponent();

    expect(screen.getByPlaceholderText(/admin@waliliens\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ACCESS OPERATIONS TERMINAL/i })).toBeInTheDocument();
  });

  it('redirects directly to /admin if already authenticated', () => {
    setupAuth(true);
    renderComponent();

    expect(screen.getByText('Admin Dashboard Landed')).toBeInTheDocument();
  });

  it('shows error notice on invalid credentials', async () => {
    setupAuth(false);
    mockLogin.mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials. Access denied.',
    });

    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByPlaceholderText(/admin@waliliens\.com/i);
    const passInput = screen.getByPlaceholderText(/••••••••••••••••/i);

    await user.type(emailInput, 'wrong@waliliens.com');
    await user.type(passInput, 'badpassword');

    const submitBtn = screen.getByRole('button', { name: /ACCESS OPERATIONS TERMINAL/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials. Access denied./i)).toBeInTheDocument();
    });
  });

  it('calls login and navigates to /admin on valid credentials', async () => {
    setupAuth(false);
    mockLogin.mockResolvedValueOnce({ success: true });

    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByPlaceholderText(/admin@waliliens\.com/i);
    const passInput = screen.getByPlaceholderText(/••••••••••••••••/i);

    await user.type(emailInput, 'admin@waliliens.com');
    await user.type(passInput, 'SuperSecretPass123!');

    const submitBtn = screen.getByRole('button', { name: /ACCESS OPERATIONS TERMINAL/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@waliliens.com', 'SuperSecretPass123!');
    });
  });
});
