// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    proxy: {
      '/auth': {
        target: 'https://api.qalauym.kz',
        changeOrigin: true,
        secure: false,  // Игнорировать валидацию SSL
      },
      '/api': {
        target: 'https://api.qalauym.kz',
        changeOrigin: true,
        secure: false,  // Игнорировать валидацию SSL
      }
    }
  }
})