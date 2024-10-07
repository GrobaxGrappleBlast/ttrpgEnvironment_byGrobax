<script lang="ts">
    import { onMount } from "svelte";


	import EditAbleList from 					"../../../../Components/editAbleList/EditAbleList.svelte"; 
    import StaticMessageHandler from 			"../../../../Components/Messages/StaticMessageHandler.svelte";
    import { Writable, writable } from "svelte/store";
    import { fade, slide } from "svelte/transition";
    import { Layout01Context } from "../../context";
    import { TTRPGSystemJSONFormatting } from 	"../../../../../../../src/Modules/graphDesigner/index";
    import { SystemPreview } from 				"../../../../../../../src/Modules/core/model/systemPreview";
    import SystemDesigner3Parts from "../../SystemDesigner/SystemDesigner3Parts.svelte";

	//let messageHandler : StaticMessageHandler;
	
	export let context	: Layout01Context; 
	let activeSystem : TTRPGSystemJSONFormatting = context.activeSystem;
	let availSystems : SystemPreview[] = [];
	
	const nullpreview = new SystemPreview();
	let activePreview: SystemPreview = nullpreview;
	let unknownString = 'unknown';

	let factory : TTRPGSystemJSONFormatting | null = null;
	

 
	onMount( () => {
		availSystems = context.availablePreviews ?? [];
		loadAllSystems();
	})

	async function loadAllSystems(){
		let response = await context.API.getAllSystems();
		context.availablePreviews = response.response;
		availSystems = response.response;
	}

	function unloadPreview(){
		activePreview = nullpreview
	}
	async function onSelectSystem( d ){
		const pre = availSystems.find( p => p.code == d); 

		// if no preview... then no. or if the preview is the same as before deselct it
		if ( activePreview == pre || !pre){
			activePreview = nullpreview;
			return false;
		}

		// select it
		activePreview = pre;

		// request the factory;
		let response = await context.API.getFactory( activePreview );
		factory = response.response;
		
		return true;
	}

	//@ts-ignore This is for rendering the unknown strnig
	nullpreview.isEditable = null;

</script>

<div class="MainAppContainerPage MainAppContainerPageSystem">
	 
	<section>
		<div class="table SystemPreviewer" data-is-edit={ false } transition:fade>
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
				<div class="tableRowColumn" >{activePreview?.code ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">editable</div> 
				<div class="tableRowColumn" >{activePreview?.isEditable ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">SystemName</div> 
				<div class="tableRowColumn" >{activePreview?.name ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">folder name</div> 
				<div class="tableRowColumn" >{activePreview?.folderName ?? unknownString}</div>
			</div>
		</div>

		<br>
		<!-- System Selector -->
		<div class="PageSystemList" >	
			<EditAbleList 
				isEditableContainer={false}
				collection= { availSystems?.map( p => {return { key : p.code , value : p.name}}) ?? [] }
				onSelect={ (e) => {onSelectSystem(e) ; return true; } } 
				on:onDeSelect={ unloadPreview }
			/> 
		</div> 


		
	</section>

	{#if factory }
		<section transition:slide >
			<div>
				<SystemDesigner3Parts 
					system={ factory }
				/>
			</div>
		</section>
	{/if}
</div>