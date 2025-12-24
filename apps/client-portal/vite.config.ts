import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const API_URL = process.env.VITE_API_URL || 'http://localhost:4000'

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  server: {
    host: '0.0.0.0',   // 🔥 THIS IS THE KEY LINE
    port: 3000,
    proxy: {
      '/api': API_URL,
      '/uploads': API_URL,
    },
  },
})

