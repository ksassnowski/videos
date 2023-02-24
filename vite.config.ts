import glob from 'glob';
import path from 'path';
import { defineConfig } from 'vite';

import motionCanvas from '@motion-canvas/vite-plugin';

export default defineConfig({
  plugins: [
    motionCanvas({
      project: glob.sync('./src/videos/*/*.ts'),
    }),
  ],
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, 'src/common'),
      '@theme': path.resolve(__dirname, 'src/theme.ts'),
    },
  },
});
