import { expect, test } from 'patchright/test';
import { accountsFor } from './accounts';

const HOME = 'https://www.tsdm39.com/';
const DAILY = 'https://www.tsdm39.com/plugin.php?id=hongbao:daily';
const accounts = accountsFor('tsdm');

if (accounts.length === 0) {
  test('tsdm daily red packet', async () => {
    test.skip(true, 'no tsdm accounts in accounts.json');
  });
}

for (const account of accounts) {
  test.describe(account.label, () => {
    // Runs at collection time: a missing auth file would otherwise fail the context
    // fixture while reading storageState, before the test body could skip.
    test.skip(!account.hasAuth, `run make tsdm-auth for account ${account.label} first`);

    test.use({ storageState: account.authFile });

    test('tsdm daily red packet', async ({ page }) => {
      await page.goto(HOME, { timeout: 600000, waitUntil: 'domcontentloaded' });

      // hongbao:daily only accepts a POST carrying a fresh formhash. A GET (or a
      // request without the form fields the page's "開" button sends) is rejected
      // with "請用頁面上的按鈕操作", so mirror that request exactly.
      const formhash = await page.locator('input[name="formhash"]').first().getAttribute('value');
      if (!formhash) {
        throw new Error('not signed in; run `make tsdm-auth` first');
      }

      const response = await page.request.post(DAILY, {
        form: { formhash },
        headers: {
          referer: HOME,
          origin: 'https://www.tsdm39.com',
          'content-type': 'application/x-www-form-urlencoded',
        },
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      // ok: claimed just now; already: idempotent success, claimed earlier today.
      expect(body.ok === true || body.already === 1, JSON.stringify(body)).toBeTruthy();
    });
  });
}
