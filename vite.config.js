import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request to /api/plantnet/... is forwarded to my-api.plantnet.org
      // This runs server-side → zero CORS issues, API key never exposed in network tab
      '/api/plantnet': {
        target: 'https://my-api.plantnet.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/plantnet/, '/v2/identify'),
      },
    },
  },
})
