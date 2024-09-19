<script lang="ts">
    import { slide } from "svelte/transition";

    import { createEventDispatcher   } from "svelte"; 
	let dispatch = createEventDispatcher();
	
	export let data: {id:string }; 
	export let hasUp 	: boolean;
	export let hasDown	: boolean;

	function moveUp(){
		dispatch('moveUp'	,data.id );
	}
	function moveDown(){
		dispatch('moveDown' ,data.id);
	}
</script>
 
 
{#if hasUp	}<div class="ItemManouverOption Up" 	role="none" on:keyup on:click={moveUp}	> </div>{/if}
{#if hasDown}<div class="ItemManouverOption Down" 	role="none" on:keyup on:click={moveDown}> </div>{/if} 

 