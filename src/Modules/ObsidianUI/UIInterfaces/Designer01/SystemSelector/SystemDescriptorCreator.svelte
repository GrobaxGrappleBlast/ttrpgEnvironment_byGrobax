<script lang="ts">

	
    import { onMount } from 'svelte';
	import './SystemDescriptor.scss'; 
	import StaticMessageHandler from '../BaseComponents/Messages/StaticMessageHandler.svelte'; 
    import { SystemPreview } from '../../../../../../src/Modules/ObsidianUICore/model/systemPreview';
	import { ObsidianUICoreAPI } from '../../../../ObsidianUICore/API'; 
    import type { APIReturnModel } from '../../../../../../src/Modules/ObsidianUICore/APIReturnModel';
	import { createEventDispatcher } from "svelte"; 

	const dispatch = createEventDispatcher();
	export let data : SystemPreview = new SystemPreview(); 
	export let onCreateCall : (sys : SystemPreview) => Promise<APIReturnModel<SystemPreview|null>>; 
	let _data 		: SystemPreview = new SystemPreview(); 

	let messageHandler:StaticMessageHandler ;
	let isValidated = false;

	onMount(()=>{
		_data = Object.assign( new SystemPreview() , data );
	}) 

	async function validate		(){
		let api = ObsidianUICoreAPI.getInstance();
		let resp = await api.systemDefinition.validateSystem(_data);
		isValidated = resp.response == true;

		messageHandler.removeAllMessages();
		for(const key in resp.messages){
			messageHandler.addMessage(key, resp.messages[key]);
		}
	}
	async function createSystem	(){
		if(!isValidated)
			return;
 
		let resp = await onCreateCall(_data); 
		if (resp.responseCode == 200 && resp.response != null){
			dispatch('onSelect', resp.response );
			dispatch('onStateEnd');
		}

		isValidated = false;
		validate();
	}
	async function cancel			(){
		dispatch('onStateEnd');
	}
	function _onChange(){
		isValidated = false;
		validate();
	} 

</script>
<div>
	<StaticMessageHandler 
		bind:this={messageHandler} 
	/>
	<div style="height:5px;"></div>
	<div class="SystemDescriptorCreator"  >

		<div>Author</div> 
		<input type="text" class='SystemDescriptorEditField'  on:change={_onChange}  bind:value= { _data.author } />

		<div>Version</div> 
		<input type="text" class='SystemDescriptorEditField' on:change={_onChange}  bind:value={_data.version} />

		<div>SystemCodeName</div> 
		<input type="text" class='SystemDescriptorEditField' on:change={_onChange}  bind:value={_data.systemCodeName} />

		<div>SystemName</div> 
		<input type="text" class='SystemDescriptorEditField' on:change={_onChange}  bind:value={_data.systemName} />
	
		<div>folder name</div> 
		<input type="text" class='GrobsInteractiveContainer SystemDescriptorEditField' on:change={_onChange}  bind:value={_data.folderName} />
	 
	</div>
	<div class="SystemDescriptorButtonRow" >
		<div class="SystemDescriptorButton" on:click={validate}		>Validate		</div>
		<div class="SystemDescriptorButton" on:click={createSystem}	data-disabled={!isValidated} >Create			</div>
		<div class="SystemDescriptorButton" on:click={cancel}		>Cancel Creation</div>
	</div>
</div>