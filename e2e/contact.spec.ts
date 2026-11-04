import { test, expect } from '@playwright/test';

test.describe('Contact Form E2E', () => {
  test('submits project brief successfully', async ({ page }) => {
    // Intercept backend contact submission API
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            success: true,
            messageId: 'WL-E2E-TEST',
            timestamp: new Date().toISOString(),
            receivedAt: 'Queue',
          },
          message: 'Project brief received successfully.',
        }),
      });
    });

    await page.goto('/contact');

    // Fill in form inputs
    await page.locator('input[placeholder*="Alex Mercer"]').fill('Neo Anderson');
    await page.locator('input[placeholder*="alex@company.com"]').fill('neo@matrix.io');
    await page.locator('textarea[placeholder*="Briefly describe"]').fill('We need to deploy full-stack autonomous AI architecture.');
    await page.getByRole('checkbox', { name: /be contacted/i }).check();

    // Submit the form
    await page.getByRole('button', { name: /DISPATCH PROPOSAL BRIEF/i }).click();

    // Verify success confirmation view
    await expect(page.locator('text=Brief Successfully Transmitted')).toBeVisible();
    await expect(page.locator('text=Neo Anderson')).toBeVisible();
  });
});
