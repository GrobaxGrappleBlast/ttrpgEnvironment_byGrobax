
<script lang="ts"> 
    import GrobaxTTRPGSystemHandler from "../../../app";
    import SystemDescriptor from "./SystemDescriptor.svelte";
	import SystemDescriptorCreator from "./SystemDescriptorCreator.svelte";
	import './SystemSelector.scss';
	import { createEventDispatcher, onMount } from "svelte"; 
    import { FilledSystemPreview, SystemPreview } from '../../../../../../src/Modules/ObsidianUI/core/model/systemPreview';
	
    import EditableList from "../BaseComponents/editAbleList/EditAbleList.svelte";
    import { writable, type Writable } from "svelte/store";
    import { slide } from "svelte/transition";
    import { FileContext } from "../../../../../../src/Modules/ObsidianUI/core/fileContext";

	let plugin: GrobaxTTRPGSystemHandler;
	const dispatch = createEventDispatcher();
	export let previews : SystemPreview[] = [];
	let _active_preview : SystemPreview = new SystemPreview();

	const SystemSelectorStates = {
		preview: "preview",
		create: "create", 
		copy:"copy",
		edit:"edit"
	}
	let state = SystemSelectorStates.preview;

	onMount(() => {
	 
	})

	function onPreviewSelected(){}
	// CREATE FUNCTIONALITY 
	function onCreateNewSystem_START(){
		state = SystemSelectorStates.create;
	} 
	async function onCreateNewSystem_END( result : SystemPreview | null ){
		state = SystemSelectorStates.preview;
		if (!result)
			return;
 
		let savedAndReloaded = await FileContext.createSystemDefinition( result );
		if (savedAndReloaded){
			previews.push(savedAndReloaded);
			previews = previews;
		}
	}  

	// COPY FUNCTIONALITY 
	let copyObject : SystemPreview;
	function onCopyNewSystem_START(){
		copyObject =  Object.assign({}, _active_preview) as SystemPreview;
		copyObject.systemName += ' (copy)';
		copyObject.systemCodeName += 'copy';
		state = SystemSelectorStates.copy;
	} 
	async function onCopyNewSystem_END( newCopy : SystemPreview | null ){
		state = SystemSelectorStates.preview;
		if (!newCopy)
			return; 
		let savedAndReloaded = await FileContext.copySystemDefinition( _active_preview,newCopy );
		if (savedAndReloaded){
			previews.push(savedAndReloaded);
			previews = previews;
		}
	}  
	
	function onSelectSystem( filePath : string ){

		let activepre = previews.find( p => p.filePath == filePath );
		if(activepre){
			_active_preview=(activepre);
			return true;
		}else{
			_active_preview=(new SystemPreview());
			return false;
		}
	}

	// EDIT FUNCTIONALITY 
	function onEditSystem_START(){

	} 
	function onEditSystem_END(){
		
	}

</script>
<div class="SystemSelectorContainer" >
	{#if (state == SystemSelectorStates.preview)}
		<div class="SystemSelectorState" transition:slide >
			<div class="SystemSelectorContainerHeader" >
				<div>
					{#key _active_preview }
						<SystemDescriptor 
							data = { _active_preview } 
						/>
					{/key} 
				</div> 
				<div class="GrobsInteractiveContainer SystemSelectorOptionsContainer"> 
					{#key previews}
						<EditableList 
							isEditableContainer={false}
							collection={previews.map( p => {return {key : p.filePath , value : p.systemName} })}
							onSelect={ onSelectSystem }
							onAdd={ onCreateNewSystem_START }
						/> 
					{/key}
				</div>
			</div>
			<div>
				{#key _active_preview }
					{#if _active_preview.filePath}
						<div transition:slide >
							<button> Load System 	</button>
							<button on:click={ onCopyNewSystem_START }> Copy System 	</button>
							{#if _active_preview.isEditable } <button> Delete System	</button> {/if}
							{#if _active_preview.isEditable } <button on:click={ onEditSystem_START }> Edit System	</button> {/if}
						</div>
					{/if}
				{/key} 
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
					<SystemDescriptorCreator 
						data = { copyObject } 
						onEnd = { onCopyNewSystem_END } 
					/>
				</div> 
			</div> 
		</div>
	{:else if (state == SystemSelectorStates.edit)}
		<div class="SystemSelectorState" transition:slide >
			<div class="SystemSelectorContainerHeader" >
				<div>
					<SystemDescriptorCreator 
						data = { copyObject } 
						onEnd = { onEditSystem_END } 
					/>
				</div> 
			</div> 
		</div>
	{/if}
</div>