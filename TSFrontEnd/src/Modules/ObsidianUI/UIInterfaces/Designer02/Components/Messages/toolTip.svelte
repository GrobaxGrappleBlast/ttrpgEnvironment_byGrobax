<script lang="ts">
    import { onMount } from "svelte";
	import {  fly } from "svelte/transition";
	import './toolTip.scss'


	export let text : string ;
	export let animX = 20;
	export let animY = 0;
	export let type : "error" | "verbose" | "good" | "none";

	let mounted = false;
	onMount(()=>{
		setTimeout(() => { mounted = true }, 100 ) 
	})
</script>
 
<div>
	{#if mounted}
		<div class="tooltipInnerBox" data-type={type} transition:fly={{x:animX, y:animY }} >
			{text}
		</div>
	{/if}
</div>