import { expect, test as setup } from 'patchright/test';
import { accountsFor } from './accounts';

const LOGIN_PAGE = 'https://www.tsdm39.com/member.php?mod=logging&action=login';
const accounts = accountsFor('tsdm');

if (accounts.length === 0) {
  setup('authenticate tsdm', async () => {
    setup.skip(true, 'no tsdm accounts in accounts.json');
  });
}

for (const account of accounts) {
  setup(`authenticate tsdm: ${account.label}`, async ({ page }) => {
    await page.goto(LOGIN_PAGE, { timeout: 600000 });

    const form = page.locator('form[name="login"]');
    await form.locator('input[name="username"]').fill(account.username);
    await form.locator('input[name="password"]').fill(account.password);
    await form.locator('button[name="loginsubmit"]').click();

    // Discuz only issues the auth cookie after a successful login.
    await expect
      .poll(
        async () => (await page.context().cookies()).some(cookie => /auth$/i.test(cookie.name) && cookie.value !== ''),
        { message: 'login failed: no auth cookie was set', timeout: 60000 }
      )
      .toBe(true);

    await page.context().storageState({ path: account.authFile });
  });
}
