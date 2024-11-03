
<script lang="ts">
    import { onMount } from "svelte";
	import { Layout01Context } from "../../../../../Layout01/context";
    import { slide } from "svelte/transition";
	 
	export let context	: Layout01Context; 
	let src			= "http://localhost:5000/api/template/d4202be1-0313-4d3c-87c6-ebe5f23542ec/UITemplateName/index.es.js";
	let styleSrc	= "http://localhost:5000/api/template/d4202be1-0313-4d3c-87c6-ebe5f23542ec/UITemplateName/style.css";
	let module;
	let App; 

	async function loadStuff2 () {
		module = await import(src);
		App = module.default; 
	}

	onMount(()=>{loadStuff2()})
</script>


<div transition:slide|local >

	{#if App}
		<svelte:component this={App}
			textData={ "{}"},
			sys={context.activeFactory}
			writeBlock={(e,a) => {}}
		/>
	{/if}
	 

</div>
