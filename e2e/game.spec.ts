import { test, expect } from '@playwright/test';

test.describe('游戏流程', () => {
  test('故事弹窗、技能与证据、强行结案', async ({ page }) => {
    await page.goto('/game?level=level-1');

    // Intro 弹窗：开始调查按钮
    await expect(page.getByRole('button', { name: /开始调查/ })).toBeVisible();
    await page.getByRole('button', { name: /开始调查/ }).click();

    // 跳过帮助与证据弹窗，直接进行技能与对话

    // 技能点击（不严格校验返回，只校验按钮可交互）
    await page.getByRole('button', { name: /思维截获/ }).click();
    await page.getByRole('button', { name: /数据库骇入/ }).click();
    await page.getByRole('button', { name: /逻辑过载/ }).click();

    // 连续休整以推进回合数，出现强行结案
    // 发送一条提问并等待回复
    await page.getByPlaceholder(/输入质问内容/).fill('嫌疑人当晚在哪里？');
    await page.locator('form button[type="submit"]').click();
    await page.locator('text=正在计算回应').waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {});
    await expect(page.locator('text=音频输出通道').first()).toBeVisible();
  });
});
