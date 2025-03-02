import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'classic' }]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: ['@mui/material', '@mui/icons-material']
  }
}) 