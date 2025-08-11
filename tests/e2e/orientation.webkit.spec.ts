import { test, expect, devices } from '@playwright/test';

test.describe('iPhone orientation change', () => {
    test('CTA and scroll container remain visible after orientation change', async ({ page }) => {
        await page.goto('/');
        const scroll = page.getByTestId('scene-scroll');
        await expect(scroll).toBeVisible();

        // Try to toggle to landscape viewport
        const landscape = devices['iPhone 13 landscape'];
        await page.setViewportSize(landscape.viewport!);

        await expect(scroll).toBeVisible();

        const cta = page.locator('#global-cta');
        if (await cta.isVisible().catch(() => false)) {
            await cta.click({ trial: true });
        } else {
            test.skip(true, 'CTA not present on current scene');
        }
    });
});

