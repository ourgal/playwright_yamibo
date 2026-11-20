import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'playwright-report/**',
      'test-results/**',
      'blob-report/**',
      'playwright/.cache/**',
      'playwright/.auth/**',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
);
