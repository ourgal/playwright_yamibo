all:
	@pnpm exec patchright test --headed tests/signin.spec.ts

auth:
	@pnpm exec patchright test --headed tests/auth.setup.ts

tsdm-auth:
	@pnpm exec patchright test --headed tests/tsdm-auth.setup.ts

tsdm-signin:
	@pnpm exec patchright test --headed tests/tsdm-signin.spec.ts
