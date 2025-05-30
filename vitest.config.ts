import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
    ],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'istanbul',
    },
  },
}); 