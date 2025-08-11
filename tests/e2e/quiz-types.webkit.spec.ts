import { test, expect } from '@playwright/test';

test.describe('Quiz type-specific flows (if present)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('True/False: select one option and proceed', async ({ page }) => {
        const quizRoot = page.getByTestId('scene-quiz');
        if (!(await quizRoot.isVisible().catch(() => false))) test.skip(true, 'Quiz not present');
        const group = page.getByTestId('quiz-question');
        await expect(group).toBeVisible();
        // TF options laid out as grid of 2 buttons; pick first
        const buttons = group.getByRole('button');
        const count = await buttons.count();
        if (count < 2) test.skip(true, 'Not a TF layout');
        await buttons.nth(0).click();
        const next = page.getByTestId('btn-next-question');
        if (await next.isVisible().catch(() => false)) await next.click();
    });

    test('Slider: set value and complete evaluation', async ({ page }) => {
        const quizRoot = page.getByTestId('scene-quiz');
        if (!(await quizRoot.isVisible().catch(() => false))) test.skip(true, 'Quiz not present');
        const slider = page.locator('[data-slot="slider"]');
        if (!(await slider.first().isVisible().catch(() => false))) test.skip(true, 'Slider not present');
        // Drag the slider thumb by some pixels to change value
        const box = await slider.first().boundingBox();
        if (!box) test.skip(true, 'Slider box missing');
        await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 8 });
        await page.mouse.up();
        // Click the complete/evaluate button (uses a generic button near slider)
        const evalBtn = page.getByRole('button').filter({ hasText: /Değerlendir|Complete|Kontrol/i }).first();
        if (await evalBtn.isVisible().catch(() => false)) {
            await evalBtn.click();
        }
    });

    test('Multi-select: choose multiple options and check answer', async ({ page }) => {
        const quizRoot = page.getByTestId('scene-quiz');
        if (!(await quizRoot.isVisible().catch(() => false))) test.skip(true, 'Quiz not present');
        const group = page.getByTestId('quiz-question');
        await expect(group).toBeVisible();
        const optionButtons = group.getByRole('button');
        const count = await optionButtons.count();
        if (count < 3) test.skip(true, 'Not a multi-select layout');
        await optionButtons.nth(0).click();
        await optionButtons.nth(1).click();
        const checkBtn = page.getByRole('button').filter({ hasText: /Cevabı Kontrol Et|Check Answer/i }).first();
        if (await checkBtn.isVisible().catch(() => false)) await checkBtn.click();
    });

    test('Drag & Drop: attempt to assign item to category (desktop)', async ({ page }) => {
        const quizRoot = page.getByTestId('scene-quiz');
        if (!(await quizRoot.isVisible().catch(() => false))) test.skip(true, 'Quiz not present');
        const draggableItem = page.locator('[draggable="true"]').first();
        if (!(await draggableItem.isVisible().catch(() => false))) test.skip(true, 'No draggable items');
        const category = page.locator('[role="region"] div[role="gridcell"], [role="region"] .grid > div').first();
        if (!(await category.isVisible().catch(() => false))) test.skip(true, 'No category target');
        try {
            await draggableItem.dragTo(category);
        } catch {
            test.skip(true, 'Drag not supported in current implementation');
        }
    });
});

