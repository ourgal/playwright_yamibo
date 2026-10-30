import { test, expect } from 'patchright/test';

const HOME_PAGE = "https://bbs.yamibo.com/plugin.php?id=zqlj_sign"

test('signin', async ({ page }) => {
  await page.goto(HOME_PAGE, { timeout: 600000});

  // The 打卡 link already reads 今日已打卡 once today's check-in is done.
  if ((await page.getByRole('link', { name: '今日已打卡'}).count()) > 0) {
    return;
  }

  await page.getByRole('link', { name: '点击打卡'}).click();

  await new Promise(resolve => setTimeout(resolve, 10000));

  await expect(page.getByRole('link', { name: '今日已打卡'})).toBeVisible();
});
