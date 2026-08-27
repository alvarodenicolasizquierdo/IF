import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    host: true,
  },
  // Relative base so the build works from a project-scoped GitHub Pages path
  // (/<repo>/) as well as from a domain root or a local file.
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
