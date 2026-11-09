import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.png', 'logo.png', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'Presensi PKBM Cahaya Mulia',
        short_name: 'PresensiKu',
        description: 'Sistem Presensi Harian Siswa PKBM Cahaya Mulia (TP 2026/2027)',
        theme_color: '#2563eb',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}']
      }
    })
  ],
  server: {
    host: true, // mengikat ke 0.0.0.0 agar bisa diakses dari jaringan luar/tunnel
    allowedHosts: true, // mengizinkan domain tunnel seperti .devtunnels.ms
  }
})
