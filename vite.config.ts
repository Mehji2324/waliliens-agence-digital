import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Development server proxy — mirrors the Nginx production config.
  // In production, Nginx serves the frontend on / and proxies /api/* to the backend.
  // In development, Vite dev server proxies /api/* to the local Express server on port 4000.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Generate source maps only for staging; omit for production to reduce bundle exposure
    sourcemap: false,
    // Chunk splitting for better caching behaviour
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('node_modules/react/')) return 'react';
          if (id.includes('react-router-dom')) return 'router';
          if (id.includes('framer-motion') || id.includes('lenis')) return 'motion';
        },
      },
    },
  },
})
