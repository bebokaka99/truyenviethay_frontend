import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://truyenviethay-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
    // Thêm dòng này để cho phép domain giả
    allowedHosts: ['truyenviethay.vn', 'localhost', '192.168.1.154'],
  },
})
