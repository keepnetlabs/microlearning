import { test, expect } from '@playwright/test';
import { goToSceneType, tryGoToSceneType } from './helpers/navigation';

test.describe('Quiz flow (if present)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('answer a question and proceed (detect MCQ if possible)', async ({ page }) => {
        const reachable = await tryGoToSceneType(page, 'quiz');
        test.skip(!reachable, 'Quiz not present in current config');
        const quizRoot = page.getByTestId('scene-quiz');
        const questionGroup = page.getByTestId('quiz-question');
        await expect(questionGroup).toBeVisible();
        // Prefer role=radio (MCQ)
        const radios = questionGroup.getByRole('radio');
        if (await radios.count().then(c => c > 0)) {
            await radios.first().click();
        } else {
            // Fallback: click first button option
            const option = questionGroup.getByRole('button').first();
            await option.click();
        }

        // Result panel or bottom sheet toggles; try next buttons if exist
        const nextQuestion = page.getByTestId('btn-next-question');
        if (await nextQuestion.isVisible().catch(() => false)) {
            await nextQuestion.click();
        }
        const nextSlide = page.getByTestId('btn-next-slide');
        if (await nextSlide.isVisible().catch(() => false)) {
            await nextSlide.click();
        }
        await expect(quizRoot).toBeVisible();
    });
});

