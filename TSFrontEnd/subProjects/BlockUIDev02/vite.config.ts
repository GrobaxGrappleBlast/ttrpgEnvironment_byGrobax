import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import autoPreprocess from 'svelte-preprocess';
 
const productionSetting = {
	plugins: [
		svelte({
			preprocess: autoPreprocess(),  
			compilerOptions: {
				customElement: true,
			}
		}),
	],
	build: {
		sourcemap: true, 
		target: 'esnext', // Target environment
		outDir: './dist', // Output directory
		emptyOutDir: true, // Clear output directory before build
		
		lib: {
			entry: 'src/index.ts',
			name: 'index',
			fileName: (format) => `index.${format}.js`,
		},
		
	},
}
const developmentSetting={
	plugins: [
	  svelte({
		preprocess: autoPreprocess(),
	  }),
	],
	build: {
	  sourcemap: true, 
	  target: 'esnext', // Target environment
	  outDir: './dist', // Output directory
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
}


const mode = (process.argv.find( p => p.startsWith('--mode'))?.split('=')[1]);
const d = {
	plugins: [
	  svelte({
		preprocess: autoPreprocess(),
	  }),
	],
	build: {
	  sourcemap: true,
	  outDir: './dist',
	  emptyOutDir: true,
	},
  }

// https://vitejs.dev/config/
export default defineConfig( () => {
 
	switch (mode){
		case 'prod':
			return productionSetting;
		case 'dev':
			return developmentSetting;
	}
})
