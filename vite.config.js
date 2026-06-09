import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// base: './' keeps paths relative; viteSingleFile inlines the JS/CSS into a
// single dist/index.html so the production build can be opened directly via
// file:// (double-click) with no server and no module-CORS issues.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  server: {
    port: 3000,
    proxy: { '/api': 'http://localhost:4000' },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
