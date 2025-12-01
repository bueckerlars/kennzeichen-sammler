import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readFileSync } from 'fs'

// Read version from root version.json
let appVersion = '1.0.0'
try {
  const versionJsonPath = path.resolve(__dirname, '../version.json')
  const versionData = JSON.parse(readFileSync(versionJsonPath, 'utf-8'))
  appVersion = versionData.version || '1.0.0'
} catch (error) {
  console.warn('Could not read version.json, using default version:', error)
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})

