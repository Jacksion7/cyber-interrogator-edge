import { test, expect } from '@playwright/test';

test.describe('首页', () => {
  test('打开首页并进入第一关', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=INTERROGATOR')).toBeVisible();
    await expect(page.locator('text=AVAILABLE_CASES')).toBeVisible();
    await expect(page.locator('text=TACTICAL_GUIDE')).toBeVisible();

    // 进入第一关
    const firstLink = page.locator('a:has-text("调查中")').first();
    await firstLink.click();
    await expect(page).toHaveURL(/\/game\?level=level-1/);
  });
});
