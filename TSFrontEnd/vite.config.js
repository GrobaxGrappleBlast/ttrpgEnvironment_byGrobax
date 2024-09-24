import path from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import builtins from 'builtin-modules'; 


const prod = (process.argv[2] === 'production');
const platform = (process.argv.find( p => p.startsWith('--platform'))?.split('=')[1]) ?? 'obsidian';

export default defineConfig(() => {
	console.log('-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- ');
	console.log('\t\tBUILDING FOR ' + platform); 
	console.log('-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- ');

    if ( platform == 'obsidian'){		
		return {
			exclude:[
				'**/*.test.ts',
				'subProjects'
			],
			plugins: [
				svelte({
					compilerOptions: { css: true,   hydratable: true },
					preprocess: sveltePreprocess(),
					
				}) 
			],
			watch: !prod,
			build: {
				sourcemap: prod ? false : 'inline',
				minify: prod,
				// Use Vite lib mode https://vitejs.dev/guide/build.html#library-mode
				commonjsOptions: {
					ignoreTryCatch: false,
				},
				lib: {
					//  './modules/mainApp/starterIndex.ts'
					entry: path.resolve(__dirname, './src/Modules/ObsidianUI/app.ts') ,
					formats: ['cjs'],
				},
				rollupOptions: {
					output: {
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
				outDir:"../",
				emptyOutDir: false,
				
			},
		}
    }else if ('web'){
		return {
			exclude:[
				'**/build/*' 
			],
			root: path.resolve(__dirname, './src/Modules/ui-browser/'),
			plugins: [svelte({
				compilerOptions: { css: true,   hydratable: true },
				preprocess: sveltePreprocess(),
				
			}) ],
			build: {
				sourcemap:'inline', 
				// Use root as the output dir
				outDir:"build",
				emptyOutDir: true,
				lib: { 
					entry: path.resolve(__dirname, './src/Modules/ui-browser/App.ts') ,
					formats: ['cjs'],
				},
				
				rollupOptions: {
					external: [
						'obsidian',
						'electron',
						'codemirror',
						'@codemirror/autocomplete',
						'@codemirror/closebrackets',
						// Add any other external dependencies if needed
						...builtins, // Add built-in node modules
					]
				},
			},
		}
    }
});
