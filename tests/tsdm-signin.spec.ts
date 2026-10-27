import { expect, test } from 'patchright/test';
import path from 'path';

const SIGN_PAGE = 'https://www.tsdm39.com/plugin.php?id=dsu_paulsign:sign';
const authFile = path.join(import.meta.dirname, '../playwright/.auth/tsdm.json');

test.use({ storageState: authFile });

test('tsdm daily sign-in', async ({ page }) => {
  await page.goto(SIGN_PAGE, { timeout: 600000 });

  const form = page.locator('#qiandao');

  if ((await form.count()) === 0) {
    // The sign form only renders while today's sign-in is still available.
    await expect(page.locator('.datalist'), 'not signed in; run `make tsdm-auth` first').toBeVisible();
    return;
  }

  await form.locator('input[name="qdxq"]').first().evaluate(input => {
    (input as HTMLInputElement).checked = true;
  });

  const todaysay = form.locator('input[name="todaysay"]');
  if (await todaysay.isVisible()) {
    await todaysay.fill('每日签到');
  }

  const [response] = await Promise.all([
    page.waitForResponse(
      res => res.request().method() === 'POST' && res.url().includes('operation=qiandao'),
      { timeout: 60000 }
    ),
    form.locator('a[onclick*="showWindow"], input[type="submit"]').first().click(),
  ]);
  expect(response.ok()).toBeTruthy();

  await page.goto(SIGN_PAGE, { waitUntil: 'domcontentloaded', timeout: 600000 });

  await expect(page.locator('#qiandao')).toHaveCount(0);
  await expect(page.locator('.datalist')).toBeVisible();
});
