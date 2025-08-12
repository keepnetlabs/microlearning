import { test, expect } from '@playwright/test';
import { goNext } from './helpers/navigation';

test.describe('Header logo size - iPhone WebKit', () => {

    test('logo shrinks after advancing to second scene (mobile)', async ({ page }) => {
        await page.goto('/');

        // Ensure Intro visible
        await expect(page.getByTestId('scene-intro')).toBeVisible();

        // Measure logo on Intro
        const introLogo = page.getByRole('banner').locator('img').first();
        await expect(introLogo).toBeVisible();
        const introBox = await introLogo.boundingBox();
        if (!introBox) test.skip(true, 'Intro logo not measurable on mobile');
        const introWidth = introBox!.width;
        const introHeight = introBox!.height;

        // Advance to next scene via Intro CTA (or nav-next)
        const moved = await goNext(page);
        if (!moved) {
            test.skip(true, 'Could not advance to second scene in current config');
        }
        // Wait a moment for layout
        await page.waitForTimeout(150);

        const secondLogo = page.getByRole('banner').locator('img').first();
        await expect(secondLogo).toBeVisible();
        const secondBox = await secondLogo.boundingBox();
        if (!secondBox) test.skip(true, 'Second scene logo not measurable on mobile');
        const secondWidth = secondBox!.width;
        const secondHeight = secondBox!.height;

        const epsilon = 1; // px tolerance for mobile rendering
        // Not larger than intro within tolerance
        expect(secondWidth - introWidth).toBeLessThanOrEqual(epsilon);
        expect(secondHeight - introHeight).toBeLessThanOrEqual(epsilon);
        // At least one dimension should shrink by > 1px
        const widthShrink = introWidth - secondWidth;
        const heightShrink = introHeight - secondHeight;
        expect(Math.max(widthShrink, heightShrink)).toBeGreaterThan(1);
    });
});


