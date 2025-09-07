import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'athmanebzn.store',
      'www.athmanebzn.store',
      'localhost',
      '127.0.0.1'
    ]
  },
  preview: {
    host: true,
    port: 4173
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
    exclude: [],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          'router-vendor': ['react-router-dom'],
          'payment-vendor': ['@paypal/react-paypal-js'],
          'utils-vendor': ['html2canvas', 'jspdf']
        }
      }
    }
  }
});
