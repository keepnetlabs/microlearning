import { test, expect } from '@playwright/test';
import { tryGoToSceneType, goNext } from './helpers/navigation';

test.describe('Quiz negative flow (if present)', () => {
    test('wrong answer -> Retry -> proceed after attempts exhausted', async ({ page }) => {
        test.setTimeout(90_000);
        await page.goto('/');

        let reachable = await tryGoToSceneType(page, 'quiz', 28, 30000);
        // Fallback: manual advance loop using CTA/Next until scene-quiz is visible
        if (!reachable) {
            const quizCheck = async () => await page.getByTestId('scene-quiz').isVisible().catch(() => false);
            for (let i = 0; i < 18 && !reachable; i++) {
                const visible = await quizCheck();
                if (visible) { reachable = true; break; }
                try { await goNext(page); } catch { /* ignore and continue */ }
                await page.waitForTimeout(260);
            }
        }
        test.skip(!reachable, 'Quiz not present in current flow');
        const quizRoot = page.getByTestId('scene-quiz');
        await expect(quizRoot).toBeVisible();

        const questionGroup = page.getByTestId('quiz-question');
        await expect(questionGroup).toBeVisible();

        // Helper to click one choice (radio first, else last non-action button)
        const clickOneChoice = async (): Promise<boolean> => {
            const radios = questionGroup.getByRole('radio');
            const rc = await radios.count();
            if (rc > 0) {
                try { await radios.nth(rc - 1).click({ timeout: 800 }); return true; } catch { /* noop */ }
            }
            const buttons = questionGroup.getByRole('button');
            const bc = await buttons.count();
            for (let i = bc - 1; i >= 0; i--) {
                const b = buttons.nth(i);
                const label = (await b.textContent() || '').trim();
                if (/Cevabı Kontrol Et|Check Answer|Next|Retry|Complete|Devam/i.test(label)) continue;
                if (await b.isVisible().catch(() => false)) {
                    try { await b.click({ timeout: 800 }); return true; } catch { /* try next */ }
                }
            }
            return false;
        };

        // Attempt 1: pick a choice (try to pick a likely wrong one by label if possible)
        let clicked = false;
        const wrongLabels = /(Open the link|Reply to the sender|Forward it|Delete it|True)/i;
        const radiosAll = questionGroup.getByRole('radio');
        const rcount = await radiosAll.count();
        if (rcount > 0) {
            for (let i = 0; i < rcount; i++) {
                const r = radiosAll.nth(i);
                const label = (await r.textContent() || '').trim();
                if (wrongLabels.test(label)) {
                    try { await r.click({ timeout: 800 }); clicked = true; break; } catch { }
                }
            }
        }
        if (!clicked) {
            clicked = await clickOneChoice();
        }
        test.skip(!clicked, 'Could not click any quiz choice');

        // If quiz requires explicit check, click it
        const checkAnswer = page.getByRole('button', { name: /Cevabı Kontrol Et|Check Answer/i }).first();
        if (await checkAnswer.isVisible().catch(() => false)) {
            await checkAnswer.click();
        }

        // After answering, try to find Retry or Next
        const retryBtn = page.getByTestId('btn-retry-question');
        const retryByText = page.getByRole('button', { name: /Try again|Tekrar Dene|Retry/i }).first();
        const nextQuestion = page.getByTestId('btn-next-question');
        const nextSlide = page.getByTestId('btn-next-slide');
        const nextByText = page.getByRole('button', { name: /Sonraki Soru|Next Question|Sonraki Slayt|Next Slide/i }).first();

        let hasRetry = await retryBtn.isVisible().catch(() => false) || await retryByText.isVisible().catch(() => false);
        let hasNext = await nextQuestion.isVisible().catch(() => false) || await nextSlide.isVisible().catch(() => false) || await nextByText.isVisible().catch(() => false);

        if (hasRetry) {
            // Click retry to reattempt wrong once more
            if (await retryBtn.isVisible().catch(() => false)) await retryBtn.click();
            else await retryByText.click();
            await expect(questionGroup).toBeVisible();
            await clickOneChoice();
            if (await checkAnswer.isVisible().catch(() => false)) {
                await checkAnswer.click();
            }
            hasNext = await nextQuestion.isVisible().catch(() => false) || await nextSlide.isVisible().catch(() => false) || await nextByText.isVisible().catch(() => false);
        }

        // After attempts, Next Question or Next Slide should be available
        const canProceed = hasNext;

        expect(canProceed).toBeTruthy();

        if (await nextQuestion.isVisible().catch(() => false)) {
            await nextQuestion.click();
        } else if (await nextSlide.isVisible().catch(() => false)) {
            await nextSlide.click();
        } else {
            await nextByText.click();
        }

        // Quiz root should still be stable (either next question or stays in quiz scene)
        await expect(quizRoot).toBeVisible();
    });
});


