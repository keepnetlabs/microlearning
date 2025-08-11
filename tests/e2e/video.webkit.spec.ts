import { test, expect } from '@playwright/test';

test.describe('Video player basic controls (if present)', () => {
    test('poster or video container visible', async ({ page }) => {
        await page.goto('/');
        const scenario = page.getByTestId('scene-scenario');
        if (!(await scenario.isVisible().catch(() => false))) {
            test.skip(true, 'Scenario scene not present');
        }
        const section = page.getByTestId('scenario-video-section');
        await expect(section).toBeVisible();
        // Basic check for video container inside
        const video = page.locator('video');
        // Not all configs may autoplay or render <video> immediately
        if (await video.count().then(c => c > 0)) {
            await expect(video.first()).toBeVisible();
        }
    });
});

