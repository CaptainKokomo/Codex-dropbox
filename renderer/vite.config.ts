import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: '../dist/renderer',
    emptyOutDir: false
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      '@state': path.resolve(__dirname, './src/state'),
      '@components': path.resolve(__dirname, './src/components'),
      '@data': path.resolve(__dirname, './src/data'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@canvas': path.resolve(__dirname, './src/canvas')
    }
  }
});
