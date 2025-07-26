// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  // server: {
  //   proxy: {
  //     // Proxy API requests to your backend
  //     '/api': {
  //       target: 'https://api.qalauym.kz',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //     // Proxy OAuth requests
  //     '/oauth2': {
  //       target: 'https://api.qalauym.kz',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //     '/login/oauth2': {
  //       target: 'https://api.qalauym.kz',
  //       changeOrigin: true,
  //       secure: false,
  //     }
  //   }
  // },
})