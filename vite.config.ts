import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['pwa-192x192.svg', 'pwa-512x512.svg'],
          manifest: {
            name: 'Destinix AI Travel',
            short_name: 'Destinix',
            description: 'AI-Powered Travel Universe',
            theme_color: '#4f46e5',
            background_color: '#030712',
            display: 'standalone',
            icons: [
              { src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
              { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml' }
            ]
          },
          workbox: {
            runtimeCaching: [
              {
                urlPattern: /^https?:\/\/.*\/api\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
                  networkTimeoutSeconds: 5,
                }
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'image-cache',
                  expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
                }
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
