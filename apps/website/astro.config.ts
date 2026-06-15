import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ncert-library.org',
  output: 'static',
  integrations: [
    react(),
    sitemap({
      filter: (page) => true,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            search: ['flexsearch'],
            ui: ['lucide-react', 'motion'],
          },
        },
      },
    },
  },
});
