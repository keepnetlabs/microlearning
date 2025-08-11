import { test, expect } from '@playwright/test';

test.describe('Language selection persists', () => {
    test('select EN then reload and verify', async ({ page }) => {
        await page.goto('/');
        const langBtn = page.getByTestId('language-button');
        await expect(langBtn).toBeVisible();
        await langBtn.click();
        const search = page.getByRole('searchbox');
        await search.fill('en');
        const option = page.getByRole('option').first();
        await option.click();

        // Verify localStorage is set
        const stored = await page.evaluate(() => localStorage.getItem('selected-language'));
        expect(stored).toBeTruthy();

        // Reload and ensure selection remains
        await page.reload();
        const storedAfter = await page.evaluate(() => localStorage.getItem('selected-language'));
        expect(storedAfter).toBe(stored);

        // Button text shows country code (US for en)
        await expect(langBtn).toContainText('US');
    });
});

