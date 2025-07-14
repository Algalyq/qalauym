import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    proxy: {
      '/auth': {
        target: 'https://13.48.172.63:8443',
        changeOrigin: true,
        secure: false,  // Ignore SSL certificate validation
        rewrite: (path) => path
      },
      '/api': {
        target: 'https://13.48.172.63:8443',
        changeOrigin: true,
        secure: false,  // Ignore SSL certificate validation
        rewrite: (path) => path
      }
    }
  }
})
