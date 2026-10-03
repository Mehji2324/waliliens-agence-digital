import { test, expect } from '@playwright/test';

test.describe('Booking Flow E2E', () => {
  test('selects a slot and completes discovery consultation booking', async ({ page }) => {
    // Intercept available slots API
    await page.route('**/api/booking/slots*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 'slot_e2e_1', date: '2026-10-15', time: '10:00', available: true },
            { id: 'slot_e2e_2', date: '2026-10-15', time: '14:00', available: true },
          ],
        }),
      });
    });

    // Intercept booking reservation API
    await page.route('**/api/booking/reserve', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            bookingId: 'BK_E2E_CONFIRMED',
            status: 'confirmed',
            scheduledTime: '2026-10-15 at 10:00 AM',
            date: '2026-10-15',
            startTime: '10:00',
            endTime: '10:30',
            durationMinutes: 30,
            timezone: 'Africa/Casablanca',
            slotId: 'slot_e2e_1',
            meetingUrl: 'https://meet.google.com/abc-defg-hij',
          },
          message: 'Booking confirmed successfully.',
        }),
      });
    });

    await page.goto('/book');

    // Wait for slot to be visible and click it
    const slotBtn = page.getByRole('button', { name: '10:00' });
    await expect(slotBtn).toBeVisible();
    await slotBtn.click();

    // Fill client details
    await page.locator('input[placeholder*="Satoshi Nakamoto"]').fill('Sarah Connor');
    await page.locator('input[placeholder*="satoshi@bitcoin.org"]').fill('sarah@cyberdyne.io');
    await page.getByRole('checkbox', { name: /privacy policy/i }).check();

    // Submit the booking
    await page.getByRole('button', { name: /CONFIRM DISCOVERY SESSION/i }).click();

    // Verify confirmation modal / card
    await expect(page.locator('text=Booking Confirmed')).toBeVisible();
    await expect(page.locator('text=BK_E2E_CONFIRMED')).toBeVisible();
    await expect(page.locator('text=JOIN GOOGLE MEET')).toBeVisible();
  });
});
