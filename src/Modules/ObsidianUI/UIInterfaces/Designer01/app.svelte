<script lang="ts">
	
    import { onMount } from "svelte"; 
    
	import SystemSelector from "./SystemSelector/SystemSelector.svelte";
	import './app.scss' 
    import SelectableCollectionV2 from "./BaseComponents/editAbleList/EditAbleList.svelte";
    import { writable } from "svelte/store";
    import { ObsidianUICoreAPI } from "../../../../../src/Modules/ObsidianUICore/API";
    import StaticMessageHandler from "./BaseComponents/Messages/StaticMessageHandler.svelte";
    import { SystemPreview } from "../../../../../src/Modules/ObsidianUICore/model/systemPreview";
    import Minus from "./BaseComponents/buttons/minus.svelte";

	let previews : SystemPreview[] = [];
	let loaded = false;
	let loadingFailed= false;
	let msgHandler : StaticMessageHandler;

	onMount( () => {
		Load()
	})
	 
	async function Load(){
		let getDataRequest =  (await ObsidianUICoreAPI.getInstance().systemDefinition.getAllSystems());
		
		if ( getDataRequest.responseCode != 200 ){
			loadingFailed = true;
			msgHandler.removeAllMessages();
			for (const key in getDataRequest.messages) {
				msgHandler.addMessage( key , getDataRequest.messages[key] );
			}
		}
		console.log(getDataRequest);

		previews = (await ObsidianUICoreAPI.getInstance().systemDefinition.getAllSystems()).response ?? [];	
		loaded = true; 
	}

</script>
<div>
	<br>
	{#if loaded }
		<SystemSelector
			previews= {previews}
		/> 
	{:else if loadingFailed}
		<div>
			<div>
				<p>Something went wrong with loading</p>
				<button>try again</button>
			</div>
			<StaticMessageHandler 
				bind:this={ msgHandler }
			/>
		</div>
	{:else}
		<div>
			<p>Loading...</p>
		</div>
	{/if}
</div>