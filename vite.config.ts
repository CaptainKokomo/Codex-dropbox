import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import path from 'node:path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    electron({
      entry: 'electron/main.ts',
      vite: {
        build: {
          outDir: 'dist/electron',
          emptyOutDir: true,
          rollupOptions: {
            output: {
              format: 'cjs'
            }
          }
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist/web',
    emptyOutDir: true
  },
  define: {
    __DEV__: mode !== 'production'
  }
}));
