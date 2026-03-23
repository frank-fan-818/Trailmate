import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@trailmate/core': path.resolve(__dirname, '../../core')
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
