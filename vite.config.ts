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
    // Performance optimizations
    middlewareMode: false,
  },
  build: {
    // Target modern browsers for smaller bundle
    target: 'ES2020',
    // Use terser for better minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Rollup options for better code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          'vendor-gsap': ['gsap'],
          'vendor-three': ['three'],
          'vendor-framer': ['framer-motion'],
          'vendor-react-gallery': ['react-image-gallery'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
    // Source maps in development only
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'gsap',
      'framer-motion',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
    esbuildOptions: {
      target: 'ES2020',
    },
  },
});
