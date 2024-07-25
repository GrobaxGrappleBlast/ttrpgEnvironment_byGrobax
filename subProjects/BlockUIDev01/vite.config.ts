import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'; 
import autoPreprocess from 'svelte-preprocess';
import builtins from 'builtin-modules'; 


const prod = (process.argv[2] === 'production');

export default defineConfig({
	plugins: [
		svelte({
		  compilerOptions: { css: true },
		  preprocess: autoPreprocess()
		})
	],
	build: {
		sourcemap: prod ? false : 'inline',
		minify: prod,
		target: 'esnext',
		// Use Vite lib mode for a single entry point
		lib: {
		  entry: path.resolve(__dirname, './src/main.ts'),
		  formats: ['cjs'],  // Use 'cjs' for CommonJS
		  name: 'MyObsidianPlugin',  // Change this to your plugin's name
		  fileName:`main.js`,
		},
		rollupOptions: {
		  output: {
			format: 'cjs',  // Ensure the format is 'cjs' for CommonJS
			entryFileNames: '[name].js',
			assetFileNames: '[name].[ext]',
		  },
		  external: [
			'obsidian',
			'electron',
			"codemirror",
			"@codemirror/*",
			"@lezer/*",
			...builtins,
		  ],
		},
		emptyOutDir: false,
		outDir: 'dist',  // Define a clear output directory
	  }
})

/*
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte({
		compilerOptions: { css: true },
		preprocess: autoPreprocess()
	})], 
	build: {
		sourcemap: prod ? false : 'inline',
		minify: prod,
		target: 'esnext',
		// Use Vite lib mode https://vitejs.dev/guide/build.html#library-mode
		commonjsOptions: {
			ignoreTryCatch: false,
		},
		lib: {
			//  './modules/mainApp/starterIndex.ts'
			entry: path.resolve(__dirname, './src/main.ts'),
			formats: ['cjs'],
		},
		rollupOptions: {
			output: {
				format: 'esm',
				// Overwrite default Vite output fileName
				entryFileNames: 'main.js',
				assetFileNames: 'styles.css',
			},
			external: ['obsidian',
				'electron',
				"codemirror",
				"@codemirror/autocomplete",
				"@codemirror/closebrackets",
				"@codemirror/collab",
				"@codemirror/commands",
				"@codemirror/comment",
				"@codemirror/fold",
				"@codemirror/gutter",
				"@codemirror/highlight",
				"@codemirror/history",
				"@codemirror/language",
				"@codemirror/lint",
				"@codemirror/matchbrackets",
				"@codemirror/panel",
				"@codemirror/rangeset",
				"@codemirror/rectangular-selection",
				"@codemirror/search",
				"@codemirror/state",
				"@codemirror/stream-parser",
				"@codemirror/text",
				"@codemirror/tooltip",
				"@codemirror/view",
				"@lezer/common",
				"@lezer/lr",
				"@lezer/highlight",
				...builtins,
			],
		},
		// Use root as the output dir
		emptyOutDir: false,
		outDir: '.',
		
	},
})

*/ 
