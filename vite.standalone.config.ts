import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'node:path';

/**
 * Standalone build: the whole console inlined into one self-contained
 * index.html — JS, CSS, fonts and the brand marks as data URIs.
 *
 * This is what a sales engineer opens with no install, no server and no
 * network: double-click the file, or host it anywhere static.
 *   npm run build:standalone
 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  base: './',
  build: {
    outDir: 'dist-standalone',
    emptyOutDir: true,
    assetsInlineLimit: 100 * 1024 * 1024, // inline every asset, fonts included
    cssCodeSplit: false,
    chunkSizeWarningLimit: 8000,
  },
});
