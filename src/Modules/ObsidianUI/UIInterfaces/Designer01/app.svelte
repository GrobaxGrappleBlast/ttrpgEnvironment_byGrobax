<script lang="ts">
	
    import { onMount } from "svelte";
    import { FileContext } from "../../core/fileContext";
    
	import SystemSelector from "./SystemSelector/SystemSelector.svelte";
	import './app.scss'
    import { SystemPreview } from "../../core/model/systemPreview";

	let fileContext = new FileContext();
	let previews : SystemPreview[] = [];

	onMount(()=>{
		fileContext.loadAllAvailableFiles();
		previews = fileContext.availableSystems;	 
	})
	

</script>
<div>
	<br>
	<SystemSelector
		previews= {previews}
	/>
</div>