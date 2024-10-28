
<script lang="ts">
    import { onMount } from "svelte";
	import { Layout01Context } from "../../../../../Layout01/context";
	 
	export let context	: Layout01Context; 
	let src = "http://localhost:5000/api/template/d4202be1-0313-4d3c-87c6-ebe5f23542ec/UITemplateName/components.js";
	let MyComponent; 
	let module;
	let d ; 
	
	async function loadStuff() {
		module = (await import(src));
		MyComponent = module.default; 
 
		// d = new MyComponent({
		// 	target:document.getElementById('SEHERHANS'),
		// 	props:{}
		// });
	}

	onMount(()=>{loadStuff()})
</script>


<div>
	<div id="SEHERHANS"></div>
	 
	{#if MyComponent}
		<svelte:component this={MyComponent} sys={null} textData={""} writeBlock={(e,a) => {}}  />
	{/if}
	

</div>
