import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/cv/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        chrono: resolve(__dirname, 'chrono.html'),
      },
      external: (id) => id.includes('Agrimat Base') || id.includes('agrimat'),
    },
  },
})