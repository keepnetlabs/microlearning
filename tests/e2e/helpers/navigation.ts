import { Page, expect, Locator } from '@playwright/test';

export async function getCurrentSceneType(page: Page): Promise<string | null> {
    const scene = page.locator('[data-scene-type]');
    const count = await scene.count();
    if (count === 0) return null;
    for (let i = 0; i < count; i++) {
        const el = scene.nth(i);
        if (await el.isVisible().catch(() => false)) {
            try {
                return (await el.getAttribute('data-scene-type')) || null;
            } catch {
                continue;
            }
        }
    }
    return null;
}

async function isSceneVisible(page: Page, sceneType: string): Promise<boolean> {
    const loc = page.locator(`[data-scene-type="${sceneType}"]`).first();
    return await loc.isVisible().catch(() => false);
}

async function tryClick(locator: Locator, timeoutMs = 800): Promise<boolean> {
    try {
        await locator.click({ noWaitAfter: true, timeout: timeoutMs });
        return true;
    } catch {
        return false;
    }
}

export async function goNext(page: Page): Promise<boolean> {
    const next = page.getByTestId('nav-next');
    if (await next.isVisible().catch(() => false)) {
        try {
            await next.click({ noWaitAfter: true, timeout: 500 });
            return true;
        } catch { }
    }
    // Fallback to CTA (click inner button for stability)
    const cta = page.getByTestId('cta-intro');
    if (await cta.isVisible().catch(() => false)) {
        const ctaButton = cta.locator('button');
        if (await ctaButton.isVisible().catch(() => false)) {
            // brief settle time for animations
            await page.waitForTimeout(60);
            try {
                await ctaButton.click({ noWaitAfter: true, timeout: 500 });
                return true;
            } catch {
                // try once more after a short wait
                await page.waitForTimeout(120);
                try {
                    await ctaButton.click({ noWaitAfter: true, timeout: 500 });
                    return true;
                } catch {
                    return false;
                }
            }
        }
    }
    return false;
}

export async function completeQuizIfPresent(page: Page): Promise<boolean> {
    const quizRoot = page.getByTestId('scene-quiz');
    if (!(await quizRoot.isVisible().catch(() => false))) return false;

    // Try to answer and advance multiple steps within quiz
    for (let i = 0; i < 6; i++) {
        // If not in quiz anymore, we're done
        const stillInQuiz = await isSceneVisible(page, 'quiz');
        if (!stillInQuiz) return true;

        const group = page.getByTestId('quiz-question');
        if (await group.isVisible().catch(() => false)) {
            // Prefer radios, but click only enabled ones
            const radios = group.getByRole('radio');
            const radioCount = await radios.count();
            let clickedOption = false;
            if (radioCount > 0) {
                for (let rIndex = 0; rIndex < radioCount; rIndex++) {
                    const r = radios.nth(rIndex);
                    if (await r.isEnabled().catch(() => false)) {
                        const ok = await tryClick(r);
                        if (!ok) continue;
                        clickedOption = true;
                        break;
                    }
                }
            } else {
                // Some question types render options as buttons
                const buttons = group.getByRole('button');
                const btnCount = await buttons.count();
                for (let bIndex = 0; bIndex < btnCount; bIndex++) {
                    const b = buttons.nth(bIndex);
                    // Skip common action buttons, try only choice-like buttons
                    const text = (await b.textContent())?.trim() || '';
                    const isAction = /Check Answer|Cevab[ıı] Kontrol Et|Next|Retry|Submit|Complete/i.test(text);
                    if (isAction) continue;
                    if (await b.isEnabled().catch(() => false)) {
                        const ok = await tryClick(b);
                        if (!ok) continue;
                        clickedOption = true;
                        break;
                    }
                }
            }
            // brief wait after selection
            if (clickedOption) await page.waitForTimeout(60);
        }

        // Try buttons in order: check answer -> next question -> next slide -> nav-next -> retry
        const checkBtn = page.getByRole('button').filter({ hasText: /Cevab[ıi] Kontrol Et|Check Answer|Complete/i }).first();
        if (await checkBtn.isVisible().catch(() => false) && await checkBtn.isEnabled().catch(() => false)) {
            await tryClick(checkBtn, 600);
            await page.waitForTimeout(100);
        }

        const nextQ = page.getByTestId('btn-next-question');
        if (await nextQ.isVisible().catch(() => false) && await nextQ.isEnabled().catch(() => false)) {
            if (await tryClick(nextQ, 600)) {
                await page.waitForTimeout(120);
                continue;
            }
        }

        const nextSlide = page.getByTestId('btn-next-slide');
        if (await nextSlide.isVisible().catch(() => false) && await nextSlide.isEnabled().catch(() => false)) {
            if (await tryClick(nextSlide, 600)) {
                await page.waitForTimeout(120);
                continue;
            }
        }

        const navNext = page.getByTestId('nav-next');
        if (await navNext.isVisible().catch(() => false) && await navNext.isEnabled().catch(() => false)) {
            if (await tryClick(navNext, 600)) {
                await page.waitForTimeout(120);
                continue;
            }
        }

        const retryBtn = page.getByTestId('btn-retry-question');
        if (await retryBtn.isVisible().catch(() => false) && await retryBtn.isEnabled().catch(() => false)) {
            if (await tryClick(retryBtn, 600)) {
                await page.waitForTimeout(120);
                continue;
            }
        }

        // If nothing to click, break
        break;
    }
    return (await getCurrentSceneType(page)) !== 'quiz';
}

export async function goToSceneType(page: Page, targetType: string, maxSteps = 16): Promise<void> {
    for (let i = 0; i < maxSteps; i++) {
        if (await isSceneVisible(page, targetType)) return;
        // If in quiz, try to progress within quiz
        if (await isSceneVisible(page, 'quiz')) {
            const progressed = await completeQuizIfPresent(page);
            if (progressed) {
                await page.waitForTimeout(220);
                continue;
            }
        }
        const moved = await goNext(page);
        if (!moved) break;
        // small wait for transition end
        await page.waitForTimeout(320);
    }
    // Final assert to fail early when scene not reachable
    await expect(page.locator(`[data-scene-type="${targetType}"]`).first()).toBeVisible();
}

export async function tryGoToSceneType(page: Page, targetType: string, maxSteps = 12, budgetMs = 6000): Promise<boolean> {
    const deadline = Date.now() + budgetMs;
    for (let i = 0; i < maxSteps && Date.now() < deadline; i++) {
        if (await isSceneVisible(page, targetType)) return true;
        // If in quiz, try to progress within quiz
        if (await isSceneVisible(page, 'quiz')) {
            const progressed = await completeQuizIfPresent(page);
            if (progressed) {
                await page.waitForTimeout(120);
                continue;
            }
        }
        const moved = await goNext(page);
        if (!moved) break;
        await page.waitForTimeout(120);
    }
    return await isSceneVisible(page, targetType);
}

