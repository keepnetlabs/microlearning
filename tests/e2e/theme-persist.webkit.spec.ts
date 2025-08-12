import { test, expect } from '@playwright/test';

test.describe('Theme persistence (desktop + mobile)', () => {
    test('dark mode persists across reloads (via toggle if visible, otherwise via localStorage)', async ({ page }) => {
        await page.goto('/');

        const getHtmlHasDark = async () => await page.evaluate(() => document.documentElement.classList.contains('dark'));
        const getSavedPref = async () => await page.evaluate(() => localStorage.getItem('theme-preference'));

        const toggle = page.getByTestId('theme-toggle');
        const toggleVisible = await toggle.isVisible().catch(() => false);

        if (toggleVisible) {
            // Desktop path: use the toggle
            await toggle.click();
            await expect.poll(getHtmlHasDark).toBeTruthy();
            await expect.poll(getSavedPref).toBe('dark');
            await page.reload();
            await expect.poll(getHtmlHasDark).toBeTruthy();
            await expect.poll(getSavedPref).toBe('dark');
            // Back to light
            await page.getByTestId('theme-toggle').click();
            await expect.poll(getHtmlHasDark).toBeFalsy();
            await expect.poll(async () => (await getSavedPref()) === 'dark' ? 'dark' : 'light').toBe('light');
        } else {
            // Mobile path: set localStorage directly and reload
            await page.evaluate(() => localStorage.setItem('theme-preference', 'dark'));
            await page.reload();
            await expect.poll(getHtmlHasDark).toBeTruthy();
            await expect.poll(getSavedPref).toBe('dark');
            // Back to light
            await page.evaluate(() => localStorage.setItem('theme-preference', 'light'));
            await page.reload();
            await expect.poll(getHtmlHasDark).toBeFalsy();
            await expect.poll(getSavedPref).toBe('light');
        }
    });
});


