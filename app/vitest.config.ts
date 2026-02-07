import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 120000, // 2 minutes for integration tests
  },
  resolve: {
    alias: {
      '@calendar-lib': path.resolve(__dirname, '../node/src/lib'),
      '@calendar-renderers': path.resolve(__dirname, '../node/src/renderers'),
    },
  },
});
