import { expect, test } from 'patchright/test';
import path from 'path';

const SIGN_PAGE = 'https://www.tuiliz.com/plugin.php?id=zqlj_sign';
const authFile = path.join(import.meta.dirname, '../playwright/.auth/tuiliz.json');

test.use({ storageState: authFile });

test('tuiliz daily sign-in', async ({ page }) => {
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
