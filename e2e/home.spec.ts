import { test, expect } from '@playwright/test';

test.describe('Home Page E2E', () => {
  test('loads home page with hero section and navigation', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Waliliens/i);

    // Verify key navigation / branding element is visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check CTA button exists
    const ctaButton = page.locator('a[href="/booking"], a[href="/contact"]').first();
    await expect(ctaButton).toBeVisible();
  });
});
