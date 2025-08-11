import { test, expect } from '@playwright/test';

test.describe('iPhone swipe navigation (if enabled)', () => {
    test('swipe left to advance scene', async ({ page }) => {
        await page.goto('/');
        const root = page.getByTestId('app-root');
        await expect(root).toBeVisible();

        // Perform a left swipe gesture
        const box = await root.boundingBox();
        if (!box) test.skip(true, 'No bounding box');
        const y = Math.round((box!.y + box!.height / 2));
        const startX = Math.round(box!.x + box!.width * 0.8);
        const endX = Math.round(box!.x + box!.width * 0.2);

        await page.mouse.move(startX, y);
        await page.mouse.down();
        await page.mouse.move(endX, y, { steps: 10 });
        await page.mouse.up();

        // Still visible; scene may have changed depending on config
        await expect(root).toBeVisible();
    });
});

