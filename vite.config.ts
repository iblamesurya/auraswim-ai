import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  base: '/auraswim-ai/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^@mediapipe\/pose$/,
        replacement: path.resolve(__dirname, './src/lib/vision/mediapipe-pose-shim.js'),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
