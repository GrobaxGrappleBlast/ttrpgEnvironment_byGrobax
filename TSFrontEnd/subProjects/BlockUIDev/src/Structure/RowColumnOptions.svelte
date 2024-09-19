<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { slide } from "svelte/transition";

	export let active : Boolean;
	export let addText = 'Add Item';
	export let remText = 'Remove This Item';
	export let offset : number = 0;
	export let side : 'left'|'right'	= 'left';
	export let verti: 'top'	|'bottom'	= 'bottom';

	export let onRemove	: (() => any )|null = null;
	export let onAdd	: (() => any )|null = null;
	
	let cssStyle  = side +':'+offset+';'+verti +':'+offset+';';
	 
</script>

{#if active} 
	<div transition:slide class="RowColumnOptions" style={cssStyle} >
		{#if onAdd		}<div class="itemOption" 		on:keyup on:click={ ()=>onAdd()		} >{ addText }</div>{/if}
		{#if onRemove	}<div class="itemOption rem"	on:keyup on:click={ ()=>onRemove()	} >{ remText }</div>{/if}
	</div>
{/if}
