import { test, expect } from '@playwright/test';

test.describe('iPhone CTA safe-area padding', () => {
    test.use({});

    test('CTA container has bottom padding on mobile', async ({ page }) => {
        await page.goto('/');
        const cta = page.locator('#global-cta');
        // If CTA yoksa (config), testi atla
        if (!(await cta.isVisible().catch(() => false))) {
            test.skip(true, 'CTA not present on intro');
        }
        const padding = await cta.evaluate((el) => getComputedStyle(el).paddingBottom);
        // Beklenen: min 16px ya da safe-area resolved değeri
        const px = parseFloat((padding || '0').replace('px', ''));
        expect(px).toBeGreaterThanOrEqual(16);
    });
});

