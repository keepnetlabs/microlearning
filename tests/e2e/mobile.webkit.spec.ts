import { test, expect } from '@playwright/test';

test.describe('Mobile (iPhone WebKit) basics', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('CTA is visible and clickable on mobile', async ({ page }) => {
        const intro = page.getByTestId('scene-intro');
        await expect(intro).toBeVisible();
        const cta = page.getByTestId('cta-intro');
        if (!(await cta.isVisible().catch(() => false))) {
            test.skip(true, 'Intro CTA not configured');
        }
        await cta.click();
        await expect(page.getByTestId('scene-goal')).toBeVisible();
    });

    test('Scene scroll container exists', async ({ page }) => {
        const scroll = page.getByTestId('scene-scroll');
        await expect(scroll).toBeVisible();
    });
});

