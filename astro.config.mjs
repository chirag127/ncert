// @ts-check

import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import AstroPWA from '@vite-pwa/astro'
import { defineConfig } from 'astro/config'

const site = 'https://ncert.oriz.in'

export default defineConfig({
  site,
  base: process.env.PUBLIC_BASE_PATH ?? '/',
  integrations: [
    react(),
    sitemap(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'NCERT — textbook directory',
        short_name: 'NCERT',
        description:
          'Free NCERT textbook directory — browse by class, subject, and language; download whole-book PDFs.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0f0d13',
        background_color: '#0f0d13',
        lang: 'en',
        categories: ['education', 'books'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,svg,woff,woff2,json}'],
        navigateFallback: '/',
        // Never serve stale API / auth / dynamic data — same-origin dynamic
        // routes bypass the navigation fallback and hit the network.
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/account/,
          /\/sitemap.*\.xml$/,
          /^\/robots\.txt$/,
        ],
        // Cross-origin (fonts.googleapis, ncert.nic.in, web3forms, CF beacon)
        // is never precached; leave those network-only by omitting runtime
        // caching for them.
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
})
