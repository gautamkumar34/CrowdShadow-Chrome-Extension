import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'rename-index-html', // name of the plugin
      closeBundle() {
        const from = resolve(__dirname, '../dist/index.html');
        const to = resolve(__dirname, '../dist/sidebar.html');

        if (fs.existsSync(from)) {
          fs.renameSync(from, to);
        } else {
          console.warn('[vite-plugin] index.html not found to rename ');
        }
      }
    }
  ],
  base: './',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        sidebar: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: `sidebar.js`,
        chunkFileNames: `[name].js`,
        assetFileNames: assetInfo => {
          if (assetInfo.name === 'style.css') return 'sidebar.css';
          return '[name].[ext]';
        },
      },
    },
    emptyOutDir: true,
  },
});
