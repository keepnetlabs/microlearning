import { test, expect } from '@playwright/test';

test.describe('Summary actions (if present)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('buttons visible and clickable', async ({ page }) => {
        const summary = page.getByTestId('scene-summary');
        if (!(await summary.isVisible().catch(() => false))) {
            test.skip(true, 'Summary scene not present in config');
        }
        const saveBtn = page.getByTestId('btn-save-finish');
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const downloadBtn = page.getByTestId('btn-download-certificate');
        await expect(downloadBtn).toBeVisible();
    });
});

