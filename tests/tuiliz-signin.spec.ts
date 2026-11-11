import { expect, test } from 'patchright/test';
import { accountsFor } from './accounts';

const SIGN_PAGE = 'https://www.tuiliz.com/plugin.php?id=zqlj_sign';
const accounts = accountsFor('tuiliz');

if (accounts.length === 0) {
  test('tuiliz daily sign-in', async () => {
    test.skip(true, 'no tuiliz accounts in accounts.json');
  });
}

for (const account of accounts) {
  test.describe(account.label, () => {
    test.use({ storageState: account.authFile });

    test('tuiliz daily sign-in', async ({ page }) => {
      test.skip(!account.hasAuth, `run make tuiliz-auth for account ${account.label} first`);

      await page.goto(SIGN_PAGE, { timeout: 600000 });

      const button = page.locator('#signBtn');

      if ((await page.locator('.sign-mini.done').count()) > 0) {
        return;
      }

      if ((await page.locator('.sign-mini.guest').count()) > 0) {
        throw new Error('not signed in; run `make tuiliz-auth` first');
      }

      await button.click();

      await expect(button).toHaveClass(/\bdone\b/, { timeout: 60000 });
      await expect(button.locator('.bt')).toHaveText('已签到');
    });
  });
}
