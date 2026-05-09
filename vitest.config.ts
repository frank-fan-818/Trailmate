import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  resolve: {
    alias: {
      '@trailmate/core': path.resolve(__dirname, 'core/index.ts'),
      '@trailmate/perception': path.resolve(__dirname, 'modules/perception/index.ts'),
      '@trailmate/modules': path.resolve(__dirname, 'modules'),
      '@trailmate/shared': path.resolve(__dirname, 'shared'),
    },
  },
  test: {
    exclude: [
      'node_modules/**',
      '.claude/**',
      '**/node_modules/**',
      '**/dist/**',
    ],
  },
})
