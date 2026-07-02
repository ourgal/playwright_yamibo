all:
	@pnpm exec patchright test --headed tests/signin.spec.ts

auth:
	@pnpm exec patchright test --headed tests/auth.setup.ts
