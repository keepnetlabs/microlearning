import { test, expect } from '@playwright/test';

// [keyboard] Desktop keyboard navigation: ArrowRight/ArrowLeft
// Relies on app's global keydown handler in App.tsx

test.describe('Keyboard navigation (desktop)', () => {
    test('ArrowRight goes next, ArrowLeft goes prev', async ({ page }, testInfo) => {
        if (testInfo.project.name.toLowerCase().includes('iphone')) {
            test.skip(true, 'Keyboard navigation is desktop-only');
        }
        await page.goto('/');

        // Intro visible
        await expect(page.getByTestId('scene-intro')).toBeVisible();

        // Press ArrowRight to go to Goal
        await page.keyboard.press('ArrowRight');
        await expect(page.getByTestId('scene-goal')).toBeVisible();

        // Press ArrowLeft to go back to Intro
        await page.keyboard.press('ArrowLeft');
        await expect(page.getByTestId('scene-intro')).toBeVisible();
    });
});


