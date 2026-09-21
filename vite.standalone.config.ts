import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'node:path';

/**
 * The one thing viteSingleFile does not reach: the favicon link in the HTML
 * shell, which stays a relative `./favicon.svg`. That resolves fine inside
 * dist-standalone, where the file is copied alongside — and 404s the moment
 * anyone moves the HTML somewhere on its own, which is the entire point of
 * this build. Inline it too.
 */
function inlineFavicon(): Plugin {
  return {
    name: 'inline-favicon',
    enforce: 'post',
    transformIndexHtml(html) {
      const svg = readFileSync(path.resolve(__dirname, 'public/favicon.svg'));
      const uri = `data:image/svg+xml;base64,${svg.toString('base64')}`;
      return html.replace(/href="\.\/favicon\.svg"/g, `href="${uri}"`);
    },
  };
}

/**
 * Standalone build: the whole console inlined into one self-contained
 * index.html — JS, CSS, fonts and the brand marks as data URIs.
 *
 * This is what a sales engineer opens with no install, no server and no
 * network: double-click the file, or host it anywhere static.
 *   npm run build:standalone
 */
export default defineConfig({
  plugins: [react(), viteSingleFile(), inlineFavicon()],
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
