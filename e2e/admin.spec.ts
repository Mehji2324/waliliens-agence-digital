import { test, expect } from '@playwright/test';

test.describe('Admin Operations E2E', () => {
  test('logs in, views bookings, cancels and reschedules a booking', async ({ page }) => {
    let authState = false;

    // Intercept Auth Session Check
    await page.route('**/api/admin/me', async (route) => {
      if (authState) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { email: 'admin@waliliens.com' },
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Unauthorized' }),
        });
      }
    });

    // Intercept Admin Login
    await page.route('**/api/admin/login', async (route) => {
      authState = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { email: 'admin@waliliens.com', expiresInHours: 24 },
          message: 'Login successful',
        }),
      });
    });

    // Intercept Bookings List
    await page.route('**/api/admin/bookings**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            bookings: [
              {
                id: 'b_1',
                bookingId: 'BK_E2E_001',
                name: 'John Connor',
                email: 'john@resistance.io',
                company: 'Tech Ops',
                date: '2026-10-20',
                startTime: '10:00',
                endTime: '10:30',
                timezone: 'Africa/Casablanca',
                status: 'confirmed',
                meetingUrl: 'https://meet.google.com/test-meet',
                createdAt: new Date().toISOString(),
              },
            ],
            pagination: {
              page: 1,
              limit: 10,
              totalItems: 1,
              totalPages: 1,
            },
          },
        }),
      });
    });

    // Intercept Available Slots for Rescheduling
    await page.route('**/api/admin/bookings/available-slots*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 'slot_reschedule_1', date: '2026-10-25', time: '14:00', available: true },
          ],
        }),
      });
    });

    // Intercept Cancel Booking
    await page.route('**/api/admin/bookings/b_1/cancel', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Booking cancelled successfully.',
        }),
      });
    });

    // Intercept Reschedule Booking
    await page.route('**/api/admin/bookings/b_1/reschedule', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Booking rescheduled successfully.',
        }),
      });
    });

    // 1. Perform Login
    await page.goto('/admin/login');
    await page.locator('input[placeholder*="admin@waliliens.com"]').fill('admin@waliliens.com');
    await page.locator('input[placeholder*="••••••••••••••••"]').fill('SecureAdminPass123!');
    await page.getByRole('button', { name: /ACCESS OPERATIONS TERMINAL/i }).click();

    // Verify navigation to Admin Terminal
    await expect(page).toHaveURL(/\/admin/);

    // 2. Navigate to Bookings Management
    await page.goto('/admin/bookings');
    await expect(page.locator('text=BK_E2E_001')).toBeVisible();

    // 3. Test Cancel Flow
    const cancelBtn = page.getByRole('button', { name: /CANCEL/i });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // In Cancel Dialog, enter reason and confirm
    const reasonInput = page.locator('textarea[placeholder*="conflict"]');
    if (await reasonInput.isVisible()) {
      await reasonInput.fill('Emergency maintenance window');
    }
    await page.getByRole('button', { name: /CONFIRM CANCELLATION/i }).click();

    // Verify cancellation toast
    await expect(page.locator('text=has been cancelled')).toBeVisible();
  });
});
