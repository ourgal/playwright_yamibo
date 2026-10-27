import { expect, test as setup } from 'patchright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const LOGIN_PAGE = 'https://www.tsdm39.com/member.php?mod=logging&action=login';
const authFile = path.join(import.meta.dirname, '../playwright/.auth/tsdm.json');

setup('authenticate tsdm', async ({ page }) => {
  setup.skip(!process.env.TSDM_USERNAME || !process.env.TSDM_PASSWORD, 'TSDM credentials are not set in .env');

  await page.goto(LOGIN_PAGE, { timeout: 600000 });

  const form = page.locator('form[name="login"]');
  await form.locator('input[name="username"]').fill(process.env.TSDM_USERNAME!);
  await form.locator('input[name="password"]').fill(process.env.TSDM_PASSWORD!);
  await form.locator('button[name="loginsubmit"]').click();

  // Discuz only issues the auth cookie after a successful login.
  await expect
    .poll(
      async () => (await page.context().cookies()).some(cookie => /auth$/i.test(cookie.name) && cookie.value !== ''),
      { message: 'login failed: no auth cookie was set', timeout: 60000 }
    )
    .toBe(true);

  await page.context().storageState({ path: authFile });
});
