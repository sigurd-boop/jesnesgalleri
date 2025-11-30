import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const DEV_PROXY_TARGET = process.env.BACKEND_PROXY_TARGET || 'http://localhost:5258';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
});
