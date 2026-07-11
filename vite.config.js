import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'icons/*.svg'],
      manifest: {
        name: 'KrishiMitra — Kisan ka Saathi',
        short_name: 'KrishiMitra',
        description: 'AI-powered farming platform for Indian farmers — Crop Doctor, Mandi Prices, Expert Connect, Loans & Schemes',
        theme_color: '#2D6A4F',
        background_color: '#F4FCF5',
        display: 'standalone',
        start_url: '/',
        categories: ['agriculture', 'business', 'utilities'],
        icons: [
          {
            src: '/icons/pwa-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/pwa-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/pwa-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.weatherapi\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Any request to /api/plantnet/... is forwarded to my-api.plantnet.org
      // This runs server-side → zero CORS issues, API key never exposed in network tab
      '/api/plantnet': {
        target: 'https://my-api.plantnet.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/plantnet/, '/v2/identify'),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase/')) return 'vendor-firebase';
          if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) return 'vendor-router';
          if (id.includes('node_modules/lucide-react/')) return 'vendor-icons';
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    minify: 'oxc',
  },
})
