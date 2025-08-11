import { test, expect } from '@playwright/test';
import { tryGoToSceneType } from './helpers/navigation';

test.describe('Summary extended actions (if present)', () => {
    test('save and finish + download available', async ({ page }) => {
        await page.goto('/');
        const reachable = await tryGoToSceneType(page, 'summary');
        test.skip(!reachable, 'Summary scene not present');
        const summary = page.getByTestId('scene-summary');
        const saveBtn = page.getByTestId('btn-save-finish');
        const downloadBtn = page.getByTestId('btn-download-certificate');
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();
        await expect(downloadBtn).toBeVisible();
    });
});

