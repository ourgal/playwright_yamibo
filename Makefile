install-browser:
	@pnpm install
	@pnpm exec patchright install chromium

all:
	@pnpm exec patchright test --headed tests/signin.spec.ts

auth:
	@pnpm exec patchright test --headed tests/auth.setup.ts

tsdm-auth:
	@pnpm exec patchright test --headed tests/tsdm-auth.setup.ts

tsdm-signin:
	@pnpm exec patchright test --headed tests/tsdm-signin.spec.ts

tuiliz-auth:
	@pnpm exec patchright test --headed tests/tuiliz-auth.setup.ts

tuiliz-signin:
	@pnpm exec patchright test --headed tests/tuiliz-signin.spec.ts

auth-all:
	@$(MAKE) auth
	@$(MAKE) tsdm-auth
	@$(MAKE) tuiliz-auth

signin-all:
	@$(MAKE) all
	@$(MAKE) tsdm-signin
	@$(MAKE) tuiliz-signin
