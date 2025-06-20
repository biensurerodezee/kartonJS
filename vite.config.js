import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',  // <-- important
  },
  build: {
    lib: {
      entry: 'index.html',
      name: 'KartonJS',
      fileName: 'index',
      formats: ['es']
    },
    minify: false,
    outDir: './dist/',
    sourcemap: true,
    emptyOutDir: false
  }
});

