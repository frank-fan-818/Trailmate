import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@trailmate/core': path.resolve(__dirname, '../../core'),
      '@trailmate/perception': path.resolve(__dirname, '../../modules/perception'),
      '@trailmate/companion-matching': path.resolve(__dirname, '../../modules/companion-matching'),
      '@trailmate/modules': path.resolve(__dirname, '../../modules')
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/minimax': {
        target: 'https://api.minimax.chat/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/minimax/, '')
      },
      '/api/baidumap': {
        target: 'https://api.map.baidu.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/baidumap/, '')
      }
    }
  }
})
