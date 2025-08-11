import { test, expect } from '@playwright/test';
import { tryGoToSceneType } from './helpers/navigation';

test.describe('Scenario video visibility (if configured)', () => {
    test('scenario video section appears', async ({ page }) => {
        await page.goto('/');
        const reachable = await tryGoToSceneType(page, 'scenario');
        test.skip(!reachable, 'Scenario not present in current config');
        const scenario = page.getByTestId('scene-scenario');
        await expect(page.getByTestId('scenario-video-section')).toBeVisible();
    });
});

