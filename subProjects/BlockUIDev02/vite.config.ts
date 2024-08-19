import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import autoPreprocess from 'svelte-preprocess';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      preprocess: autoPreprocess(),
    }),
  ],
  build: {
    sourcemap: true, 
    target: 'esnext', // Target environment
    outDir: 'dist', // Output directory
    emptyOutDir: true, // Clear output directory before build
    rollupOptions: {
      input: './index.html', // Main entry point of your app
      output: {
        entryFileNames: '[name].js', // Output filename pattern
        chunkFileNames: '[name].js', // Chunk filename pattern
        assetFileNames: '[name][extname]', // Asset filename pattern
      },
    },
  },
})
