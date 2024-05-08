
<script lang="ts">
    import GrobaxTTRPGSystemHandler from "../../../app";
    import SystemDescriptor from "./SystemDescriptor.svelte";
	import SystemDescriptorCreator from "./SystemDescriptorCreator.svelte";
	import './SystemSelector.scss';
	import { createEventDispatcher, onMount } from "svelte"; 
    import { FilledSystemPreview, SystemPreview } from '../../../../../../src/Modules/ObsidianUI/core/model/systemPreview';
	
    import EditableList from "../BaseComponents/editAbleList/EditAbleList.svelte";
    import { writable } from "svelte/store";
    import { slide } from "svelte/transition";
    import { FileContext } from "../../../../../../src/Modules/ObsidianUI/core/fileContext";

	let plugin: GrobaxTTRPGSystemHandler;
	const dispatch = createEventDispatcher();
	export let previews : SystemPreview[] = [];
	let _active_preview : SystemPreview | undefined = undefined ;

	const SystemSelectorStates = {
		preview: "preview",
		create: "create", 
		copy:"copy"
	}
	let state = SystemSelectorStates.preview;

	onMount(() => {
		debugger
	})

	function onClickSystem( self ){
		debugger;
	}

	function onPreviewSelected(){}
	function onCreateNewSystem_START(){
		state = SystemSelectorStates.create;
	} 
	function onCreateNewSystem_END( result : SystemPreview | null ){
		state = SystemSelectorStates.preview;
		if (!result)
			return;

		FileContext.createSystemDefinition( result );
	} 

</script>
<div class="SystemSelectorContainer" >
	{#if (state == SystemSelectorStates.preview)}
		<div class="SystemSelectorState" transition:slide >
			<div class="SystemSelectorContainerHeader" >
				<div>
					<SystemDescriptor 
						data = { _active_preview } 
					/>
				</div> 
				<!--
					previews.map(p => p.systemName )

					collection={['a','b','c','d','e','f','g','h','j'] }
					collection={previews.map(p => p.systemName )}
					previews.map(p => p.systemName )

				-->
				<div class="GrobsInteractiveContainer SystemSelectorOptionsContainer"> 
					<EditableList 
						isEditableContainer={false}
						collection={previews.map( p => {return {key : p.filePath , value : p.systemName} })}
						onSelect={ (s) =>{console.log(s); return true} }
						onAdd={ onCreateNewSystem_START }
					/> 
				</div>
			</div>
			 
			
		</div>
	{:else if (state == SystemSelectorStates.create)}
		<div class="SystemSelectorState" transition:slide >
			<div class="SystemSelectorContainerHeader" >
				<div>
					<SystemDescriptorCreator 
						data = { new FilledSystemPreview() } 
						onEnd = { onCreateNewSystem_END } 
					/>
				</div> 
			</div> 
		</div>
	{:else if (state == SystemSelectorStates.copy)}
		<div class="SystemSelectorState" transition:slide >
			<div class="SystemSelectorContainerHeader" >
				<div>
					<SystemDescriptor 
						data = { _active_preview }
						edit = { true }
					/>
				</div> 
			</div>
		</div> 
	{/if}
</div>