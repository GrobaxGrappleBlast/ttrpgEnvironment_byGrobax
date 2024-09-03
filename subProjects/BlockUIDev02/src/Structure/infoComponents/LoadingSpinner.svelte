<script lang="ts">
    import type { Writable } from "svelte/store";
    import { fly } from "svelte/transition";
 
	export let active : Writable<boolean>;  

</script>
<div class="LoadingSpinner" > 
	{#if $active}
		<div class="spinner" data-state="ongoing" transition:fly={{x:100}} >
			<div>Editing.. close editing to save..</div>
		</div> 
	{/if}
</div>