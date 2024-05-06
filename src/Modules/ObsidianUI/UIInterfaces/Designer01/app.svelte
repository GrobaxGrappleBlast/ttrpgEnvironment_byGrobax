<script lang="ts">
	
    import { onMount } from "svelte";
    import { FileContext } from "../../core/fileContext";
    
	import SystemSelector from "./SystemSelector/SystemSelector.svelte";
	import './app.scss'
    import { SystemPreview } from "../../core/model/systemPreview";
    import SelectableCollectionV2 from "./BaseComponents/editAbleList/EditAbleList.svelte";
    import { writable } from "svelte/store";

	let fileContext = new FileContext();
	let previews : SystemPreview[] = [];

	onMount(()=>{
		fileContext.loadAllAvailableFiles();
		previews = fileContext.availableSystems ?? [];	 
	})
	 
</script>
<div>
	<br>
	<SystemSelector
		previews= {previews}
	/> 
</div>