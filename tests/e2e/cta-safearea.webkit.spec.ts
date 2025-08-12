import { test, expect } from '@playwright/test';
import { tryGoToSceneType } from './helpers/navigation';

test.describe('iPhone CTA safe-area padding', () => {
    test.use({});

    test('CTA container has bottom padding on mobile', async ({ page }) => {
        await page.goto('/');
        // Try intro first, fallback to goal scene
        let cta = page.locator('#global-cta');
        if (!(await cta.isVisible().catch(() => false))) {
            const hasGoal = await tryGoToSceneType(page, 'goal');
            test.skip(!hasGoal, 'CTA not present on intro or goal');
            cta = page.locator('#global-cta');
        }
        const padding = await cta.evaluate((el) => getComputedStyle(el).paddingBottom);
        // Beklenen: min 16px ya da safe-area resolved değeri
        const px = parseFloat((padding || '0').replace('px', ''));
        expect(px).toBeGreaterThanOrEqual(16);
    });
});

