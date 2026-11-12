import { expect, test } from '@playwright/test';
import { PROJECTS } from '../src/data/projects';

const viewports = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const routes = [
  '/',
  '/about',
  '/services',
  '/work',
  '/contact',
  '/book',
  '/this-route-does-not-exist',
  '/admin/login',
  '/admin',
  '/admin/bookings',
  '/admin/bookings/example',
  '/admin/contacts',
];

for (const width of viewports) {
  test(`all routes fit a ${width}px viewport`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.setViewportSize({ width, height: 850 });

    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByText('STUDIO INITIALIZED')).toHaveCount(0);
      await expect(page.locator('#main-content')).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.readyState)).toBe('complete');

      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        offenders: Array.from(document.body.querySelectorAll<HTMLElement>('*'))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName,
              className: typeof element.className === 'string' ? element.className : '',
              text: element.innerText?.slice(0, 60),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            };
          })
          .filter((element) => element.right > window.innerWidth + 2)
          .sort((a, b) => b.right - a.right)
          .slice(0, 8),
      }));

      expect(
        dimensions.document,
        `${route} has horizontal document overflow at ${width}px: ${JSON.stringify(dimensions)}`,
      ).toBeLessThanOrEqual(dimensions.viewport + 1);
      expect(
        dimensions.body,
        `${route} has horizontal body overflow at ${width}px: ${JSON.stringify(dimensions)}`,
      ).toBeLessThanOrEqual(dimensions.viewport + 1);

      if (route === '/' && [320, 360, 768, 1440].includes(width)) {
        await page.screenshot({ path: `test-results/responsive-home-${width}.png`, fullPage: true });
        await page.screenshot({ path: `test-results/responsive-home-viewport-${width}.png` });
        const telemetry = page.getByText('Custom Codebase').locator('xpath=ancestor::section');
        await telemetry.scrollIntoViewIfNeeded();
        await page.waitForTimeout(650);
        await telemetry.screenshot({ path: `test-results/responsive-telemetry-${width}.png` });
      }

      if (route === '/') {
        const clippedNavigationControls = await page.getByRole('navigation', { name: 'Primary' }).evaluate((navigation) =>
          Array.from(navigation.querySelectorAll<HTMLElement>('a, button'))
            .filter((element) => getComputedStyle(element).display !== 'none')
            .map((element) => ({
              label: element.getAttribute('aria-label') || element.textContent?.trim().slice(0, 32) || element.tagName,
              right: element.getBoundingClientRect().right,
            }))
            .filter((element) => element.right > window.innerWidth + 1),
        );
        expect(clippedNavigationControls, `Clipped navigation controls at ${width}px`).toEqual([]);
      }
    }

    expect(pageErrors, `JavaScript errors at ${width}px`).toEqual([]);
  });
}

test('mobile navigation opens, closes, and follows links', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  await expect(page.getByText('STUDIO INITIALIZED')).toHaveCount(0);

  const menuButton = page.getByRole('button', { name: 'Open Navigation Menu' });
  await menuButton.click();
  const drawer = page.getByRole('dialog', { name: 'Mobile navigation' });
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

  await page.getByRole('button', { name: 'Open Navigation Menu' }).click();
  await page.getByRole('dialog', { name: 'Mobile navigation' }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('button', { name: 'Open Navigation Menu' })).toHaveAttribute('aria-expanded', 'false');
});

test('authenticated admin pages fit mobile, tablet, and desktop layouts', async ({ page }) => {
  test.setTimeout(60_000);
  await page.route('**/api/admin/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: { email: 'admin@waliliens.com', role: 'admin' } }),
  }));
  await page.route('**/api/admin/dashboard', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data: {
        stats: { totalBookings: 0, confirmedBookings: 0, cancelledBookings: 0, completedBookings: 0, upcomingCalls: 0, todayCalls: 0, thisWeekCalls: 0 },
        upcomingBookings: [],
        recentContacts: [],
      },
    }),
  }));
  await page.route('**/api/admin/bookings*', (route) => {
    const path = new URL(route.request().url()).pathname;
    const isDetails = path.endsWith('/example');
    return route.fulfill({
      status: isDetails ? 404 : 200,
      contentType: 'application/json',
      body: JSON.stringify(isDetails
        ? { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found.' } }
        : { success: true, data: { bookings: [], total: 0, page: 1, limit: 10, totalPages: 0 } }),
    });
  });
  await page.route('**/api/admin/contacts*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: { contacts: [], total: 0, page: 1, limit: 10, totalPages: 0 } }),
  }));

  for (const width of viewports) {
    await page.setViewportSize({ width, height: 800 });
    for (const route of ['/admin', '/admin/bookings', '/admin/bookings/example', '/admin/contacts']) {
      await page.goto(route);
      await expect(page.locator('#main-content')).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(dimensions.document, `${route} at ${width}px`).toBeLessThanOrEqual(dimensions.viewport + 1);
      expect(dimensions.body, `${route} at ${width}px`).toBeLessThanOrEqual(dimensions.viewport + 1);

      if (width === 320 && route === '/admin') {
        await page.getByRole('button', { name: 'Open admin navigation' }).click();
        await expect(page.getByRole('link', { name: 'Bookings' })).toBeVisible();
        await page.getByRole('link', { name: 'Bookings' }).click();
        await expect(page).toHaveURL(/\/admin\/bookings$/);
      }
    }
  }
});

test('project preview modal stays within the viewport and closes with Escape', async ({ page }) => {
  await page.route('**/api/projects', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: PROJECTS }),
  }));

  for (const width of [320, 768, 1440]) {
    const height = 800;
    await page.setViewportSize({ width, height });
    await page.goto('/work');
    const projectCard = page.getByRole('button', { name: /Chronos Spatial OS/ });
    await expect(projectCard).toBeVisible();
    await projectCard.click();

    const dialog = page.getByRole('dialog', { name: 'Chronos Spatial OS' });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(height);

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }
});
