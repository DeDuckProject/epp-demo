import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/epp-demo/', // Base path for GitHub Pages
  test: {
    globals: true,
    environment: 'node',
    include: ['src/engine_real_calculations/**/*.test.ts'],
  }
})
