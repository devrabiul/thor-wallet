import { copyFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves this project at https://<user>.github.io/thor-wallet/,
// so every built asset URL needs that prefix. Dev stays at '/'.
const BASE = '/thor-wallet/';

// Two things GitHub Pages needs that a plain `vite build` doesn't produce.
// Emitted here rather than in CI so a local build is deploy-ready too.
const githubPages = () => {
  let outDir;

  return {
    name: 'github-pages-artifacts',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      // Pages has no SPA rewrite rule (unlike vercel.json). Serving index.html
      // as the 404 body lets the router handle a hard refresh on a deep link
      // such as /thor-wallet/login.
      copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'));
      // Stop the Jekyll pass from discarding files whose names start with '_'.
      writeFileSync(join(outDir, '.nojekyll'), '');
    },
  };
};

export default defineConfig(({ command, isPreview }) => ({
  // `preview` serves the built output, so it needs the same base the build
  // baked into index.html. Only the dev server stays at '/'.
  base: command === 'build' || isPreview ? BASE : '/',
  plugins: [
    tailwindcss(),
    githubPages(),
  ],
}));
