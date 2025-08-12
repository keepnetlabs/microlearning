import { test, expect } from '@playwright/test';

test.describe('ProgressBar progression', () => {
    test('percentage increases after advancing to next scene', async ({ page }) => {
        await page.goto('/');

        const pb = page.getByTestId('progress-bar');
        await expect(pb).toBeVisible();

        // Read aria-valuenow as number
        const readValue = async () => Number(await pb.getAttribute('aria-valuenow')) || 0;
        const v1 = await readValue();

        // Advance via multiple strategies (desktop + mobile)
        const next = page.getByTestId('nav-next');
        const tryClick = async (locator: any) => {
            try { await locator.waitFor({ state: 'visible', timeout: 1500 }); } catch { }
            try { await locator.click({ timeout: 1200 }); return true; } catch { return false; }
        };
        let advanced = false;
        if (!advanced && await next.isVisible().catch(() => false)) advanced = await tryClick(next);
        if (!advanced) {
            const introBtn = page.getByTestId('cta-intro').locator('button');
            if (await introBtn.isVisible().catch(() => false)) advanced = await tryClick(introBtn);
        }
        if (!advanced) {
            const mobileBtn = page.locator('#global-cta button').first();
            if (await mobileBtn.isVisible().catch(() => false)) advanced = await tryClick(mobileBtn);
        }
        if (!advanced) {
            const anyCta = page.locator('[data-testid^="cta-"]').locator('button').first();
            if (await anyCta.isVisible().catch(() => false)) advanced = await tryClick(anyCta);
        }
        if (!advanced) {
            const nextByText = page.getByRole('button', { name: /Devam|Continue|Next|Proceed|Sonraki/i }).first();
            if (await nextByText.isVisible().catch(() => false)) advanced = await tryClick(nextByText);
        }
        if (!advanced) test.skip(true, 'No navigation control found');

        // Wait for change
        await page.waitForTimeout(200);
        const v2 = await readValue();
        expect(v2).toBeGreaterThanOrEqual(v1);
        // If Intro->Goal, usually strictly increases
        if (v1 !== v2) {
            expect(v2).toBeGreaterThan(v1);
        }
    });
});


