import { test, expect } from '@playwright/test';
import { tryGoToSceneType } from './helpers/navigation';

test.describe('Actionable Content scene (if present)', () => {
    test('cards visible and CTA clickable', async ({ page }) => {
        await page.goto('/');
        const reachable = await tryGoToSceneType(page, 'actionable_content');
        test.skip(!reachable, 'Actionable content scene not present');

        const root = page.getByTestId('scene-actionable');
        await expect(root).toBeVisible();

        // At least one card visible
        const firstCard = page.getByTestId('action-card-0');
        await expect(firstCard).toBeVisible();

        // If CTA exists, click it (should advance or at least be clickable)
        const cta = page.getByTestId('cta-actionable');
        if (await cta.isVisible().catch(() => false)) {
            await cta.click();
        }
    });

    test('keyboard Enter moves focus to next card (desktop likely)', async ({ page }) => {
        await page.goto('/');
        const reachable = await tryGoToSceneType(page, 'actionable_content');
        test.skip(!reachable, 'Actionable content scene not present');

        const card0 = page.getByTestId('action-card-0');
        const card1 = page.getByTestId('action-card-1');
        test.skip(!(await card1.isVisible().catch(() => false)), 'Second card not present');

        await card0.focus();
        await page.keyboard.press('Enter');

        const activeId = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.id || '');
        expect(activeId).toBe('action-card-1');
    });
});


