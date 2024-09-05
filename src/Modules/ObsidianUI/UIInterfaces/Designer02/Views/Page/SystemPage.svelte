<script lang="ts">
    import { onMount } from "svelte";


	import EditAbleList from "../../Components/editAbleList/EditAbleList.svelte";
    import { ObsidianUICoreAPI } from "../../../../../../../src/Modules/ObsidianUICore/API";
    import StaticMessageHandler from "../../Components/Messages/StaticMessageHandler.svelte";
    import { SystemPreview } from "../../../../../../../src/Modules/ObsidianUICore/model/systemPreview";
    import { Writable, writable } from "svelte/store";
    import { TTRPGSystemJSONFormatting } from "../../../../../../../src/Modules/Designer";

	//let messageHandler : StaticMessageHandler;
	export let activeSystem : TTRPGSystemJSONFormatting = new TTRPGSystemJSONFormatting();
	let availSystems : Writable<SystemPreview[]> = writable([]);
	const nullpreview = new SystemPreview();
	let activePreview: SystemPreview = nullpreview;
	let unknownString = 'unknown';

	onMount( async () => {
		let req = await ObsidianUICoreAPI.getInstance().systemDefinition.getAllSystems();
		if(req.responseCode != 200){
			Object.keys(req.messages).forEach( key  => {
				const msg = req.messages[key];
			});
			return;
		}
		availSystems.set(req.response ?? [] );
		console.log($availSystems)
	})

	async function loadsystem(preview){ 
		let req = await ObsidianUICoreAPI.getInstance().systemFactory.getOrCreateSystemFactory(preview);
		if(req.responseCode != 200 || !req.response){
			Object.keys(req.messages).forEach( key  => {
				const msg = req.messages[key];
			});
			return false;
		} 
		activeSystem = req.response; 
	}
	function loadPreview(preview){
		activePreview = preview
	}
	function onSelectSystem( d ){

		const pre = $availSystems.find( p => p.systemCodeName == d);

		if(activePreview == pre){
			activePreview = nullpreview;
			return false;
		}

		loadPreview(pre);
		return true;
	}

</script>

<div class="MainAppContainerPage">
	 
	<section>
		<!-- System Selector -->
		<div>	
			<EditAbleList 
				isEditableContainer={false}
				collection= { $availSystems?.map( p => {return { key : p.systemCodeName , value : p.systemName}}) ?? [] }
				onSelect={ onSelectSystem } 
				on:onDeSelect={ () => { }}
			/> 
		</div> 
		<div class="table" data-is-edit={ false } >
			<div class="tableRow">
				<div class="tableRowColumn">Author</div> 
				<div class="tableRowColumn" >{activePreview?.author ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">Version</div> 
				<div class="tableRowColumn" >{activePreview?.version ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">SystemCodeName</div> 
				<div class="tableRowColumn" >{activePreview?.systemCodeName ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">editable</div> 
				<div class="tableRowColumn" >{activePreview?.isEditable ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">SystemName</div> 
				<div class="tableRowColumn" >{activePreview?.systemName ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">folder name</div> 
				<div class="tableRowColumn" >{activePreview?.folderName ?? unknownString}</div>
			</div>
		</div>
	</section>
</div>