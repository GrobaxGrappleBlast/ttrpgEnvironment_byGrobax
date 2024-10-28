
<script lang="ts">
    import { onMount } from "svelte";
	import { Layout01Context } from "../../../../../Layout01/context";
	 
	export let context	: Layout01Context; 
	let src			= "http://localhost:5000/api/template/d4202be1-0313-4d3c-87c6-ebe5f23542ec/UITemplateName/index.es.js";
	let styleSrc	= "http://localhost:5000/api/template/d4202be1-0313-4d3c-87c6-ebe5f23542ec/UITemplateName/style.css";
	let module;
	let App;
	let appInstance; 

	
	async function loadStuff() {
		module = (await import(src));
		App = module.default;
		appInstance = new App({
			target:	document.getElementById('app'),
			props:{
					textData: "{}"
				}	
		}) 
	}

	async function loadStuff2 () {
		const container = document.getElementById('SEHERHANS') as HTMLDivElement;
		const div = document.createElement('div');
		container.appendChild(div);

		// i need to get the Style.css Can you help
		const styleTag = document.createElement('style');
		const cssResponse = (await fetch(styleSrc));
		const cssText = await cssResponse.text();
		styleTag.innerHTML = cssText; // Add CSS to the style tag
		container.appendChild(styleTag);

		const script = document.createElement('script');
		script.src = src;
		script.async = true;
		script.type = 'module';
		container.appendChild(script);
		
		script.onload = async () => {
			
			// Dynamically import the module after the script has loaded
			const module = await import(src);
        	const App = module.default; // Get the default export

			new App({
				target: div, // Use the created div as the target
				props: {
					textData: "{}",
					sys: context.activeFactory,
					writeBlock: (e,a) => {}
				},
			});
		}

		return () => {
			let container = document.getElementById('app') as HTMLDivElement;
			container.removeChild(script); 	
			container.removeChild(div); 	
		}; 
	}

	onMount(()=>{loadStuff2()})
</script>


<div>
	<div id="SEHERHANS"></div>
	 

</div>
