
<script lang="ts">
    import { onMount, SvelteComponent } from "svelte";
	import { Layout01Context } from "../../../../context";
    import { slide } from "svelte/transition";
	 
	
	export let context: Layout01Context; 
    let Component : typeof SvelteComponent | null = null;
    let error = null;

	let src			= "http://localhost:5000/api/template/d4202be1-0313-4d3c-87c6-ebe5f23542ec/UITemplateName/index.es.js";
	let styleSrc	= "http://localhost:5000/api/template/d4202be1-0313-4d3c-87c6-ebe5f23542ec/UITemplateName/style.css";
 
    async function loadComponent() {
        try {
            // Load CSS
            const cssResponse = await fetch(styleSrc);
            if (!cssResponse.ok) throw new Error(`HTTP error! status: ${cssResponse.status}`);
            const cssText = await cssResponse.text();

            // Create and append style element
            const styleTag = document.createElement('style');
            styleTag.innerHTML = cssText;
            document.head.appendChild(styleTag);

            // Dynamically import the Svelte component
            const module = await import(src);
            Component = module.default.constructor; // Get the default export (the component)
        } catch (err) {
            error = err.message;
            console.error("Error loading component:", error);
        }
    }
	
	onMount(loadComponent);
</script>


<div transition:slide|local >

	{#if error}
		<p>Error loading component: {error}</p>
	{:else if Component}
		<svelte:component this={Component} {...{
			textData: "{}",
			sys: context.activeFactory,
			writeBlock: (e, a) => {}
		}} />
	{:else}
		<p>Loading...</p>
	{/if}

</div>
