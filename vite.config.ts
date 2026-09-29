import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative paths so the same build works in the Android WebView,
  // Electron (file://) and on a web server.
  base: './',
  plugins: [react()],
  worker: {
    format: 'es',
  },
  build: {
    // pdf.js and SheetJS are large but lazy-loaded; no need to warn.
    chunkSizeWarningLimit: 2500,
  },
})
