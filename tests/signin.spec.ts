import { test, expect } from 'patchright/test';
import { accountsFor } from './accounts';

const HOME_PAGE = "https://bbs.yamibo.com/plugin.php?id=zqlj_sign"
const accounts = accountsFor('yamibo');

if (accounts.length === 0) {
  test('signin', async () => {
    test.skip(true, 'no yamibo accounts in accounts.json');
  });
}

for (const account of accounts) {
  test.describe(account.label, () => {
    test.use({ storageState: account.authFile });

    test('signin', async ({ page }) => {
      test.skip(!account.hasAuth, `run make auth for account ${account.label} first`);

      await page.goto(HOME_PAGE, { timeout: 600000});

      // The 打卡 link already reads 今日已打卡 once today's check-in is done.
      if ((await page.getByRole('link', { name: '今日已打卡'}).count()) > 0) {
        return;
      }

      await page.getByRole('link', { name: '点击打卡'}).click();

      await new Promise(resolve => setTimeout(resolve, 10000));

      await expect(page.getByRole('link', { name: '今日已打卡'})).toBeVisible();
    });
  });
}
