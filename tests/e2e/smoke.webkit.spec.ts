import { test, expect } from '@playwright/test';

test.describe('Safari/WebKit smoke', () => {
    test('loads app and sees key scenes', async ({ page }) => {
        await page.goto('/');
        // Intro scene root
        await expect(page.getByTestId('app-root')).toBeVisible();
        // Progress bar present
        await expect(page.getByTestId('progress-bar')).toBeVisible();
        // CTA intro if configured can be optional; check scene exists
        await expect(page.getByTestId('scene-intro')).toBeVisible({ timeout: 10_000 });
    });
});

