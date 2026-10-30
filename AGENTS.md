# AGENTS.md

Personal daily sign-in ("签到"/打卡) automation for three Chinese forum sites: yamibo (bbs.yamibo.com), TSDM (tsdm39.com), and tuiliz.com. Built on **Patchright** — a patched Playwright fork that avoids bot detection — running **headful** (visible browser).

## Commands

Everything runs through the Makefile; `package.json` has no scripts. pnpm is the enforced package manager (`devEngines` in package.json).

```sh
make install-browser   # pnpm install + patchright install chromium (first-time setup)
make auth              # yamibo: login and save auth state
make tsdm-auth         # tsdm: login and save auth state
make tuiliz-auth       # tuiliz: login and save auth state
make all               # yamibo sign-in
make tsdm-signin       # tsdm sign-in
make tuiliz-signin     # tuiliz sign-in
make auth-all          # all three auth setups sequentially
make signin-all        # all three sign-ins sequentially
```

All Make targets pass `--headed` — **do not remove this**. Headful mode is deliberate: the sites use bot detection and Patchright's stealth is unreliable in headless. Same for `pnpm exec patchright install chromium` — plain `playwright install` will not install the patched browser.

HTML report: `pnpm exec patchright show-report` (reporter is `html` in playwright.config.ts).

## Credentials

Read from `.env` (gitignored) via `dotenv.config()` at the top of each setup file:

- yamibo: `MY_USERNAME`, `MY_PASSWORD`
- tsdm: `TSDM_USERNAME`, `TSDM_PASSWORD`
- tuiliz: `TUILIZ_USERNAME`, `TUILIZ_PASSWORD`

The tsdm and tuiliz auth setups **self-skip** when their credentials are missing; the yamibo setup does not — it fails on the non-null `!` assertions. When adding a site, prefer the self-skip pattern.

## Architecture

Two file types per site, paired by naming convention:

- `tests/<site>-auth.setup.ts` — interactive login; saves cookies/storage to `playwright/.auth/<site>.json` (gitignored) via `page.context().storageState()`
- `tests/<site>-signin.spec.ts` — loads the saved state with `test.use({ storageState: authFile })` and performs the daily check-in

Auth and sign-in are separate runs so daily sign-ins never repeat the login flow. Exception: `signin.spec.ts` (yamibo) sets no storageState of its own — it relies on the `chromium` project's global `storageState: 'playwright/.auth/user.json'` in playwright.config.ts, so `make all` fails unless `make auth` ran first.

playwright.config.ts defines two projects: `setup` (matches `*.setup.ts`) and `chromium`. Make targets always pin a single file, which is what makes this work: a setup file only matches the `setup` project, a spec only matches `chromium`. Running bare `pnpm exec patchright test` would execute everything at once — don't.

## Gotchas

- **Already-signed-in-today is a success path, not a failure.** These specs run daily and must be idempotent: tsdm checks `#qiandao` count === 0 then asserts `.datalist` is visible; tuiliz checks `.sign-mini.done`. Preserve this when editing.
- **Discuz login verification**: Discuz (tsdm, tuiliz) only issues its auth cookie after a successful login. Both setups `expect.poll` the cookie jar for a name ending in `auth`. Reuse this pattern for any new Discuz site.
- **Long timeouts are deliberate.** Most `page.goto` calls use `timeout: 600000` (10 min) because the sites are slow/unstable. Don't "tighten" them.
- `signin.spec.ts` (yamibo) contains a hardcoded 10-second `setTimeout` sleep after clicking 打卡 — leave it; the site needs it before the confirmation UI appears.
- tsdm's sign form is driven via `evaluate()` to check the mood radio and `waitForResponse` on the `operation=qiandao` POST — DOM assertions alone race with the form's JS.
- Setup projects write auth files under `playwright/.auth/`; the directory may not exist until first run.

## Environment notes

- ESM project (`"type": "module"`); uses `import.meta.dirname` (Node 20.11+).
- There is no tsconfig.json. The LSP reports errors like "Cannot find module 'patchright/test'" and implicit-any on `page` when `node_modules` is absent — run `make install-browser` first; the tests run fine regardless since Patchright transpiles TS itself.
- No CI is configured; `retries`/`workers`/`forbidOnly` react to a `CI` env var but nothing sets it.

## Adding a new site

Follow the established pair: copy a `<site>-auth.setup.ts` + `<site>-signin.spec.ts`, add `<site>-auth` and `<site>-signin` Make targets (plus entries in `auth-all`/`signin-all`), add `<SITE>_USERNAME`/`<SITE>_PASSWORD` to `.env`, and use the cookie-poll login check + idempotent "already signed" handling. If it's a Discuz site, the tsdm files are the template; if it matches yamibo's zqlj_sign plugin, tuiliz is the template.
