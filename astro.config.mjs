import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  server: {
    port: 3500,
  },
  integrations: [icon()],
  site: 'https://jev.info',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
