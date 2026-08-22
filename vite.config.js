import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// Served from the domain root in dev, build and preview alike. There is no
// subpath prefix to account for now that the project isn't published to
// GitHub Pages.
// Accept any Host header — this gets served from whatever domain is pointed at
// it, so there's no fixed list to keep in sync.
export default defineConfig({
  base: '/',
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
  plugins: [
    tailwindcss(),
  ],
});
