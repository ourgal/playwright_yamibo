import { test, expect } from 'patchright/test';

const HOME_PAGE = "https://bbs.yamibo.com/plugin.php?id=zqlj_sign"

test('signin', async ({ page }) => {
  await page.goto(HOME_PAGE);

  await page.getByRole('link', { name: '点击打卡'}).click();

  await new Promise(resolve => setTimeout(resolve, 5000));

  await expect(page.getByRole('link', { name: '今日已打卡'})).toBeVisiable();
});
