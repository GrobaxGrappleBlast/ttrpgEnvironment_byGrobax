<script lang="ts">
	import StaticMessageHandler from './../Designer01/BaseComponents/Messages/StaticMessageHandler.svelte';
    import { ObsidianUICoreAPI } from "../../../../../src/Modules/ObsidianUICore/API";

	export let WriteDown : (txt : string) => any;
	let api = ObsidianUICoreAPI.getInstance();
	let msgHandler;

	async function LoadSystemOptions(){
		//let resp = await api.systemDefinition.getAllSystems();
		let resp = await api.tests.CallTestError();
		if (resp.responseCode != 200){
			let k =Object.keys(resp.messages);
			for (let i = 0; i < k.length; i++) {
				const key = k[i];
				const msg = resp.messages[key];
				msgHandler.addMessage(key, msg);
			}
			return;
		}
	}
	LoadSystemOptions();


</script>
<div class="BODYSTRUCTURE" >
	<StaticMessageHandler 
		bind:this={msgHandler}

	/>
	
 
</div>
<style >
	.BODYSTRUCTURE{
		width:100%;
		min-height: 200px;
		border-radius: 5px;
		background-color: gray;
		padding:10px;
	}
</style>