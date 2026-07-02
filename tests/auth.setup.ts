import { expect, test as setup } from 'patchright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const currentDir = import.meta.dirname;
const authFile = path.join(currentDir, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('https://bbs.yamibo.com/forum.php');

  await page.getByRole('link', { name: '登录'}).click();

  await page.fill('input[name="username"]', process.env.MY_USERNAME!);
  await page.fill('input[name="password"]', process.env.MY_PASSWORD!);

  await page.getByRole('button', { name: '登录'}).click();

  await expect(page.getByRole('link', { name: '签到' })).toBeVisible();

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
