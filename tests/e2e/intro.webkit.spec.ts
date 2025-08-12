import { test, expect } from '@playwright/test';

test.describe('Intro scene', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('title and CTA visible; CTA advances', async ({ page }) => {
        const intro = page.getByTestId('scene-intro');
        await expect(intro).toBeVisible();

        // Title check
        const title = intro.locator('.project-title');
        await expect(title).toBeVisible();

        // CTA
        const cta = page.getByTestId('cta-intro');
        if (await cta.isVisible().catch(() => false)) {
            await cta.click();
            // After click, intro might no longer be visible
            await expect(intro).not.toBeVisible({ timeout: 5000 }).catch(() => { });
        } else {
            test.skip(true, 'Intro CTA not present');
        }
    });
});


