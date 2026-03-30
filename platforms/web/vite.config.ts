import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@trailmate/core': path.resolve(__dirname, '../../core')
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          content: [
            path.resolve(__dirname, "./index.html"),
            path.resolve(__dirname, "./src/**/*.{vue,js,ts,jsx,tsx}"),
          ],
          theme: {
            extend: {
              colors: {
                primary: '#3B82F6',
                secondary: '#F97316',
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
              },
            },
          },
        }),
        autoprefixer,
      ],
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/minimax': {
        target: 'https://api.minimax.chat/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/minimax/, '')
      }
    }
  }
})
