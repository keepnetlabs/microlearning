import { test, expect } from '@playwright/test';
import { tryGoToSceneType } from './helpers/navigation';

test.describe('Summary actions (if present)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('buttons visible and clickable', async ({ page }) => {
        const reachable = await tryGoToSceneType(page, 'summary');
        test.skip(!reachable, 'Summary scene not present in config');
        const summary = page.getByTestId('scene-summary');
        const saveBtn = page.getByTestId('btn-save-finish');
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const downloadBtn = page.getByTestId('btn-download-certificate');
        await expect(downloadBtn).toBeVisible();
    });
});

