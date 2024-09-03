<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { slide } from "svelte/transition";

    export let active: Boolean;
    export let addText = "Add Item";
    export let remText = "Remove This Item";
    export let offset: number = 0;
    export let side: "left" | "right" = "left";
    export let verti: "top" | "bottom" = "bottom";

    export let onRemove: (() => any) | null = null;
    export let onAdd: (() => any) | null = null;

    let cssStyle = side + ":" + offset + ";" + verti + ":" + offset + ";";
</script>

{#if active} 
        {#if onAdd}
			<div
                class="itemOption add"
                role="none"
                on:keyup
                on:click={() => onAdd()}
            >
            	<span>+</span>{addText}
            </div>
		{/if}
        {#if onRemove}
			<div
                class="itemOption rem"
                role="none"
                on:keyup
                on:click={() => onRemove()}
            >
             X
            </div>
		{/if}
 
{/if}
