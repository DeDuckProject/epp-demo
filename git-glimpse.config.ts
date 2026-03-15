import type { GitGlimpseConfig } from '@git-glimpse/core';

export default {
  app: {
    startCommand: 'npm run dev',
    readyWhen: { url: 'http://localhost:5173/epp-demo/' },
  },
  trigger: {
    mode: 'auto',
  },
  recording: {
    format: 'gif',
    maxDuration: 30,
    viewport: { width: 1280, height: 720 },
  },
} satisfies GitGlimpseConfig;
