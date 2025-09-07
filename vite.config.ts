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
    include: [
      'react', 
      'react-dom', 
      '@supabase/supabase-js',
      'react-router-dom',
      'lucide-react',
      'react-hot-toast'
    ],
    exclude: [],
    force: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'vendor': ['@supabase/supabase-js', 'lucide-react', 'react-hot-toast', 'react-router-dom']
        }
      }
    }
  }
});
