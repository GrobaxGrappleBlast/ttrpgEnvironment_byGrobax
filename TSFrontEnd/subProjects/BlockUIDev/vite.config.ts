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
		target: 'modules', // Target environment
		outDir: 'export', // Output directory
		emptyOutDir: true, // Clear output directory before build
		lib: {
			entry: 'src/index.ts',
			name: '<<name>>',
			fileName: 'components',
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
}



// https://vitejs.dev/config/
export default defineConfig( ({mode}) => {
	//const isProduction = mode === 'prod';
	//if( isProduction ){
		//return productionSetting;
	//}
  return developmentSetting;
})
