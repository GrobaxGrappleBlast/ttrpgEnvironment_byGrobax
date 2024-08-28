<script lang="ts">
    import { slide } from "svelte/transition";

    import { createEventDispatcher, onMount } from "svelte";
    import { CNode } from "./ComponentNode";
    import { viewNameIndex } from "./ViewNameIndex";
    import CustomSelect from "../importedComponents/CustomSelect/CustomSelect.svelte";
	let dispatch = createEventDispatcher();
	
	export let data: {id:string };
	export let editMode:boolean; 
	export let hasUp 	: boolean;
	export let hasDown	: boolean;

	function moveUp(){
		dispatch('moveUp'	,data.id );
	}
	function moveDown(){
		dispatch('moveDown' ,data.id);
	}
</script>
<div  class="ItemManouverContainer" >
	{#if editMode }
		<div class="ItemManouverOptions" >
			{#if hasUp	}<div class="ItemManouverOption" role="none" on:keyup on:click={moveUp}	>Up</div>{/if}
			{#if hasDown}<div class="ItemManouverOption" role="none" on:keyup on:click={moveDown}>Down</div>{/if}
		</div>
	{/if}
</div>
 