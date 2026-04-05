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
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              if (id.includes('motion') || id.includes('lucide')) {
                return 'ui-vendor';
              }
              if (id.includes('jspdf') || id.includes('pdfjs') || id.includes('pdf')) {
                return 'pdf-vendor';
              }
              if (id.includes('html2canvas') || id.includes('ort')) {
                return 'image-vendor';
              }
              return 'other-vendor';
            }

            // Page chunks
            if (id.includes('/pages/')) {
              const match = id.match(/\/pages\/([^/]+)\.tsx?/);
              if (match) {
                return `pages-${match[1].toLowerCase()}`;
              }
            }

            // Component chunks - only split large component groups
            if (id.includes('/components/')) {
              if (id.includes('CareerToolsUI')) {
                return 'career-tools-ui';
              }
            }
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
