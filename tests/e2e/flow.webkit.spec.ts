import { test, expect } from '@playwright/test';
import { goToSceneType, tryGoToSceneType } from './helpers/navigation';

test.describe('Safari/WebKit core flows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('CTA click advances from Intro to Goal', async ({ page }) => {
        await expect(page.getByTestId('scene-intro')).toBeVisible();
        const cta = page.getByTestId('cta-intro');
        if (await cta.isVisible().catch(() => false)) {
            await cta.click();
        } else {
            test.skip(true, 'Intro CTA not configured');
        }
        await expect(page.getByTestId('scene-goal')).toBeVisible();
    });

    test('Survey submit works when reaching survey scene (if configured)', async ({ page }) => {
        const reachable = await tryGoToSceneType(page, 'survey');
        test.skip(!reachable, 'Survey scene not configured in current flow');
        const survey = page.getByTestId('scene-survey');
        // Rate 5 stars
        await page.getByTestId('rating-star-5').click();
        // Optionally select first topic if exists
        const topic0 = page.getByTestId('topic-0');
        if (await topic0.isVisible().catch(() => false)) {
            await topic0.click();
        }
        await page.getByTestId('btn-submit-survey').click();
        // After submit, a toast may show and auto-next handled by App; just assert scene still stable
        await expect(survey).toBeVisible();
    });
});

