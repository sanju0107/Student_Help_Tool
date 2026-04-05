import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Enable source maps in development for debugging
      sourcemap: mode === 'development',
      
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          // Manual chunk configuration for better code splitting
          manualChunks: {
            // Core dependencies first
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['motion', 'lucide-react', 'framer-motion', 'canvas-confetti', 'clsx', 'tailwind-merge'],
            'pdf-vendor': ['pdf-lib', 'pdfjs-dist', 'jspdf', 'docx', 'mammoth'],
            'image-vendor': ['html2canvas', 'browser-image-compression', 'react-easy-crop'],
          },

          // Minimize CSS in production
          minifyInternalExports: mode === 'production',
        },
      },

      // Report compressed size
      reportCompressedSize: true,

      // CSS code split
      cssCodeSplit: true,

      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'motion/react',
        'lucide-react',
        'react-helmet-async',
      ],
    },
  };
});
