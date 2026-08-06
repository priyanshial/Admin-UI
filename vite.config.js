import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'https://7kqj89gs-8000.usw2.devtunnels.ms/',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
