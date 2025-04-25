import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/engine_real_calculations/**/*.test.ts',
      'tests/**/*.test.ts',
    ],
  },
}); 