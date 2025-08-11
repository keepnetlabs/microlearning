import { test, expect } from '@playwright/test';

test.describe('Language selection flow', () => {
    test.use({ locale: 'en-US' });
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            try { localStorage.removeItem('selected-language'); } catch { }
        });
        await page.goto('/');
    });

    test('change language to fr via search', async ({ page }) => {
        const langBtn = page.getByTestId('language-button');
        await expect(langBtn).toBeVisible();
        await langBtn.click();
        const search = page.getByRole('searchbox');
        await expect(search).toBeVisible();
        await search.fill('fr');
        const firstOption = page.getByRole('option').first();
        await firstOption.click();
        // dropdown closes
        await expect(langBtn).toHaveAttribute('aria-expanded', 'false');
        // language persisted
        const selected = await page.evaluate(() => localStorage.getItem('selected-language'));
        expect(selected).toBeTruthy();
    });
});

