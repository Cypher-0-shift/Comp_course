import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      // Inject service worker registration into the app automatically
      injectRegister: 'auto',
      // Include these files in the precache manifest
      includeAssets: ['*.webp', '*.svg', '*.png', '*.ico'],
      manifest: {
        name: 'SRMIST Compensatory Course Dashboard',
        short_name: 'CCD Portal',
        description: 'SRMIST Compensatory Course Dashboard for students and faculty',
        theme_color: '#001941',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/8.-SRM-Logo-300x300.webp',
            sizes: '192x192',
            type: 'image/webp',
          },
          {
            src: '/8.-SRM-Logo-300x300.webp',
            sizes: '512x512',
            type: 'image/webp',
          },
        ],
      },
      workbox: {
        // Precache all built assets
        globPatterns: ['**/*.{js,css,html,webp,svg,png,ico,woff2}'],
        // Runtime caching strategies
        runtimeCaching: [
          {
            // Cache Supabase API calls — stale-while-revalidate for fast reads
            urlPattern: ({ url }) =>
              url.hostname.includes('supabase.co') && url.pathname.includes('/rest/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                // API responses expire after 5 minutes
                maxAgeSeconds: 5 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Supabase Auth endpoints — network first (always get fresh tokens)
            urlPattern: ({ url }) =>
              url.hostname.includes('supabase.co') && url.pathname.includes('/auth/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-auth-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60,
              },
            },
          },
          {
            // Google Fonts — cache-first (fonts never change)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // Skip waiting — new service worker activates immediately
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        // Enable SW in dev mode so you can test offline behavior
        enabled: false,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  define: {
    'process.env': {},
    'import.meta.env.VITE_APP_TYPE': JSON.stringify(process.env.VITE_APP_TYPE || 'student'),
  },

  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Let Vite handle chunk splitting automatically
      },
    },
  },

  esbuild: {
    drop: ['console', 'debugger'],
  },
})