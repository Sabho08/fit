import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from the current directory
  const env = loadEnv(mode, './', '');
  
  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      proxy: {
        '/api': env.VITE_API_URL || 'http://localhost:5000'
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  }
})
