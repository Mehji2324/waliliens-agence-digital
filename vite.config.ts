import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
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
  // Guardrail: VITE_API_URL is development-only. A stray local .env file
  // (e.g. uploaded by `vercel deploy` from a developer machine) must never
  // leak an absolute localhost API URL into a production bundle — that makes
  // every visitor's browser call their own localhost and fail with
  // "Failed to load projects". In production builds the frontend always
  // talks to the same origin via relative /api/... requests.
  define: mode === 'production'
    ? { 'import.meta.env.VITE_API_URL': 'undefined' }
    : {},
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
}))
