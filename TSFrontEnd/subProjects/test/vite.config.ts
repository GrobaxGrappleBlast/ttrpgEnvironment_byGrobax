import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess';

/*
	// https://vite.dev/config/
	export default defineConfig({
		plugins: [svelte({ preprocess: sveltePreprocess() })],
		build: {
			sourcemap: true, 
			target: 'esnext', // Target environment
			outDir: 'dist', // Output directory
			emptyOutDir: true,
			rollupOptions: {
				input: 'src/main.ts', // Specify your entry file here
				output: {
					entryFileNames: '[name].js', // Output filename pattern
					chunkFileNames: '[name].js', // Chunk filename pattern
					assetFileNames: '[name][extname]', // Asset filename pattern
				},
			}	
		}
	})
*/
export default defineConfig({
	plugins: [
	  svelte({
		preprocess: sveltePreprocess(),
	  }),
	],
	build: {
	  sourcemap: true,
	  target: 'esnext',
	  outDir: 'dist',
	  emptyOutDir: true,
	  lib: {
		entry: 'src/main.ts',
		name: 'index',
		fileName: (format) => `your-library.${format}.js`,
	  },
	  rollupOptions: {
		// Externalize dependencies that shouldn't be bundled
		external: ['svelte'],
		output: {
		  globals: {
			svelte: 'svelte',
		  },
		},
	  },
	},
  });