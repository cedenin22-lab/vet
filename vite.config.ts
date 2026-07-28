import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'html2pdf.js': '/node_modules/html2pdf.js/dist/html2pdf.bundle.min.js',
    },
  },
  optimizeDeps: {
    include: ['html2pdf.js'],
  },
});
