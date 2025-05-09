

// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
      include: ['routes/**/*.js'],        // ✅ Only include route files
      exclude: [
        'server.js',
        'supabaseClient.js',
        '__mocks__/**',
        'lib/**',
        '**/*.test.js'
      ]
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
