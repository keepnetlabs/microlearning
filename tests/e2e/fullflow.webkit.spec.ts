import { test, expect } from '@playwright/test';
import { goToSceneType, tryGoToSceneType } from './helpers/navigation';

test.describe('Full flow (if configured)', () => {
    test('scenario → quiz → survey → summary', async ({ page }) => {
        await page.goto('/');

        const hasScenario = await tryGoToSceneType(page, 'scenario');
        test.skip(!hasScenario, 'Scenario not present in current config');
        await expect(page.getByTestId('scene-scenario')).toBeVisible();

        // Move to quiz
        await goToSceneType(page, 'quiz');
        await expect(page.getByTestId('scene-quiz')).toBeVisible();

        // Move to survey (helper will complete quiz if needed)
        const hasSurvey = await tryGoToSceneType(page, 'survey');
        test.skip(!hasSurvey, 'Survey not present in current config');
        await expect(page.getByTestId('scene-survey')).toBeVisible();

        // Simple survey interaction if elements exist
        const star5 = page.getByTestId('rating-star-5');
        if (await star5.isVisible().catch(() => false)) {
            await star5.click();
        }
        const submit = page.getByTestId('btn-submit-survey');
        if (await submit.isVisible().catch(() => false)) {
            await submit.click();
        }

        // Move to summary
        const hasSummary = await tryGoToSceneType(page, 'summary');
        test.skip(!hasSummary, 'Summary not present in current config');
        await expect(page.getByTestId('scene-summary')).toBeVisible();
    });
});


