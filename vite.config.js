import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',  // <-- important
  },
  build: {
    lib: {
      entry: 'KartonElement.js',
      name: 'KartonJS',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    minify: false,
    outDir: '.',
    sourcemap: true,
    emptyOutDir: false
  }
});

