import { test, expect } from '@playwright/test';

test.describe('Header logo size - desktop', () => {
    test('logo shrinks after advancing to second scene', async ({ page }) => {
        await page.goto('/');

        // Ensure Intro visible
        await expect(page.getByTestId('scene-intro')).toBeVisible();

        // Measure logo on Intro
        const introLogo = page.getByRole('banner').locator('img').first();
        await expect(introLogo).toBeVisible();
        const introBox = await introLogo.boundingBox();
        if (!introBox) test.skip(true, 'Intro logo not measurable');
        const introWidth = introBox!.width;

        // Advance to next scene via Intro CTA
        const cta = page.getByTestId('cta-intro');
        if (await cta.isVisible().catch(() => false)) {
            await cta.click();
        } else {
            // fallback: try keyboard next (ArrowRight)
            await page.keyboard.press('ArrowRight');
        }
        await page.waitForTimeout(150);

        const secondLogo = page.getByRole('banner').locator('img').first();
        await expect(secondLogo).toBeVisible();
        const secondBox = await secondLogo.boundingBox();
        if (!secondBox) test.skip(true, 'Second scene logo not measurable');
        const goalWidth = secondBox!.width;

        const diff = introWidth - goalWidth;
        expect(diff).toBeGreaterThanOrEqual(0);
    });
});


