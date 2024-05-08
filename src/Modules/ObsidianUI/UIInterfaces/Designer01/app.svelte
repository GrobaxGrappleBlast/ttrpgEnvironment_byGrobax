<script lang="ts">
	
    import { onMount } from "svelte";
    import { FileContext } from "../../core/fileContext";
    
	import SystemSelector from "./SystemSelector/SystemSelector.svelte";
	import './app.scss'
    import { SystemPreview } from "../../core/model/systemPreview";
    import SelectableCollectionV2 from "./BaseComponents/editAbleList/EditAbleList.svelte";
    import { writable } from "svelte/store";

	let fileContext = FileContext.getInstance();
	let previews : SystemPreview[] = [];
	let loaded = false;

	onMount( async () => {
		await fileContext.loadAllAvailableFiles(); 
		previews = fileContext.availableSystems ?? [];	
		loaded = true; 
	})
	 
</script>
<div>
	<br>
	{#if loaded }
		<SystemSelector
			previews= {previews}
		/> 
	{:else}
		<div>
			<p>Loading...</p>
		</div>
	{/if}
</div>