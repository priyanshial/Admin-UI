import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://rzjjwjvz-8000.use.devtunnels.ms',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
