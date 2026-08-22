import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// Served from the domain root in dev, build and preview alike. There is no
// subpath prefix to account for now that the project isn't published to
// GitHub Pages.
export default defineConfig({
  base: '/',
  plugins: [
    tailwindcss(),
  ],
});
