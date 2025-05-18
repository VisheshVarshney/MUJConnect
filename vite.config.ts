import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['MUJ-CONNECT.png'],
      manifest: {
        name: 'MUJ Connect',
        short_name: 'MUJ Connect',
        description: 'Manipal University Jaipur Connect - Your campus companion',
        theme_color: '#000000',
        icons: [
          {
            src: 'MUJ-CONNECT.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'MUJ-CONNECT.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
