import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',  // <-- important
  },
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'KartonJS',
      fileName: 'index',
      formats: ['es']
    },
    minify: false,
    outDir: 'dist',
    sourcemap: true
  }
});

