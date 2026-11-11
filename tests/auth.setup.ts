import { expect, test as setup } from 'patchright/test';
import { accountsFor } from './accounts';

const accounts = accountsFor('yamibo');

if (accounts.length === 0) {
  setup('authenticate yamibo', async () => {
    setup.skip(true, 'no yamibo accounts in accounts.json');
  });
}

for (const account of accounts) {
  setup(`authenticate yamibo: ${account.label}`, async ({ page }) => {
    await page.goto('https://bbs.yamibo.com/forum.php');

    await page.getByRole('link', { name: '登录'}).click();

    await page.fill('input[name="username"]', account.username);
    await page.fill('input[name="password"]', account.password);

    await page.getByRole('button', { name: '登录'}).click();

    await expect(page.getByRole('link', { name: '签到' })).toBeVisible();

    await page.context().storageState({ path: account.authFile });
  });
}
