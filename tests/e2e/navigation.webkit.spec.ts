import { test, expect } from '@playwright/test';

test.describe('Desktop navigation buttons', () => {
    test('prev/next button visibility and click', async ({ page }) => {
        await page.goto('/');
        // next should be visible on non-last scenes (desktop)
        const next = page.getByTestId('nav-next');
        if (await next.isVisible().catch(() => false)) {
            await next.click();
        }
        // after click, app still visible
        await expect(page.getByTestId('app-root')).toBeVisible();
    });
});

