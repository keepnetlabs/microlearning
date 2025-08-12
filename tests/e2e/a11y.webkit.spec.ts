import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { tryGoToSceneType } from './helpers/navigation';

type SceneDef = { type: string; testId: string };

const scenes: SceneDef[] = [
    { type: 'intro', testId: 'scene-intro' },
    { type: 'goal', testId: 'scene-goal' },
    { type: 'scenario', testId: 'scene-scenario' },
    { type: 'actionable_content', testId: 'scene-actionable' },
    { type: 'quiz', testId: 'scene-quiz' },
    { type: 'survey', testId: 'scene-survey' },
    { type: 'summary', testId: 'scene-summary' },
    { type: 'nudge', testId: 'scene-nudge' },
];

const assertNoSerious = async (page: any, testId: string) => {
    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .include(`[data-testid="${testId}"]`)
        .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toHaveLength(0);
};

const toggleThemeIfAvailable = async (page: any) => {
    const toggle = page.getByTestId('theme-toggle');
    if (await toggle.isVisible().catch(() => false)) {
        await toggle.click();
        // small settle
        await page.waitForTimeout(150);
        return true;
    }
    return false;
};

test.describe('A11y (axe) across scenes (if present)', () => {
    for (const scene of scenes) {
        test(`scene=${scene.type} has no serious/critical violations`, async ({ page }) => {
            await page.goto('/');
            let reachable = true;
            if (scene.type !== 'intro') {
                reachable = await tryGoToSceneType(page, scene.type);
            }
            test.skip(!reachable, `${scene.type} not present in current config`);
            await expect(page.getByTestId(scene.testId)).toBeVisible();
            // Light mode
            await assertNoSerious(page, scene.testId);
            // Dark mode (if toggle exists)
            if (await toggleThemeIfAvailable(page)) {
                await assertNoSerious(page, scene.testId);
                // Revert
                await toggleThemeIfAvailable(page);
            }
        });
    }
});

test.describe('Guided a11y flow (Intro→Goal→Scenario→Actionable→Quiz→Survey→Summary)', () => {
    test('no serious/critical violations along the main flow (if present)', async ({ page }) => {
        await page.goto('/');

        // Start at intro
        await expect(page.getByTestId('scene-intro')).toBeVisible();
        await assertNoSerious(page, 'scene-intro');

        const sequence: Array<{ type: string; testId: string }> = [
            { type: 'goal', testId: 'scene-goal' },
            { type: 'scenario', testId: 'scene-scenario' },
            { type: 'actionable_content', testId: 'scene-actionable' },
            { type: 'quiz', testId: 'scene-quiz' },
            { type: 'survey', testId: 'scene-survey' },
            { type: 'summary', testId: 'scene-summary' },
        ];

        for (const step of sequence) {
            const reachable = await tryGoToSceneType(page, step.type, 20, 15000);
            if (!reachable) continue; // skip silently if not present
            await expect(page.getByTestId(step.testId)).toBeVisible();
            await assertNoSerious(page, step.testId);
            if (await toggleThemeIfAvailable(page)) {
                await assertNoSerious(page, step.testId);
                await toggleThemeIfAvailable(page);
            }
        }
    });
});


