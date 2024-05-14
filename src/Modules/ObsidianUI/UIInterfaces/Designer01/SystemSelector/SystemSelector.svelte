
<script lang="ts"> 
    import GrobaxTTRPGSystemHandler from "../../../app";
    import SystemDescriptor from "./SystemDescriptor.svelte";
	import SystemDescriptorCreator from "./SystemDescriptorCreator.svelte";
	import './SystemSelector.scss';
	import { createEventDispatcher, onMount } from "svelte"; 
    
    import EditableList from "../BaseComponents/editAbleList/EditAbleList.svelte";
    import { writable, type Writable } from "svelte/store";
    import { slide } from "svelte/transition";
    import { FilledSystemPreview, SystemPreview } from "../../../../../../src/Modules/ObsidianUICore/model/systemPreview"; 
	import {ObsidianUICoreAPI} from '../../../../../../src/Modules/ObsidianUICore/API'
    import type { APIReturnModel } from "../../../../../../src/Modules/ObsidianUICore/APIReturnModel";
    import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";

	let plugin: GrobaxTTRPGSystemHandler;
	const dispatch = createEventDispatcher();
	let previews : SystemPreview[] = [];
	let _active_preview : SystemPreview = new SystemPreview();
	let api = ObsidianUICoreAPI.getInstance();
	let editList: EditableList;
	
	let loaded = false;
	let loadingFailed = false;
	let loadingFailedmsgHandler:StaticMessageHandler; 


	const SystemSelectorStates = {
		preview: "preview",
		create: "create", 
		copy:"copy",
		edit:"edit"
	}
	let state = SystemSelectorStates.preview;


	onMount( () => {
		Load()
	})
	async function Load(){
		let getDataRequest =  (await ObsidianUICoreAPI.getInstance().systemDefinition.getAllSystems());
		
		if ( getDataRequest.responseCode != 200 ){
			loadingFailed = true;
			loadingFailedmsgHandler.removeAllMessages();
			for (const key in getDataRequest.messages) {
				loadingFailedmsgHandler.addMessage( key , getDataRequest.messages[key] );
			}
		}

		console.log(getDataRequest);
		previews = (await ObsidianUICoreAPI.getInstance().systemDefinition.getAllSystems()).response ?? [];	
		loaded = true; 
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

	// is used for maintaining the state before changes are made.
	// this is then parsed to the edits and copies.
	let copyObject : SystemPreview;
	async function onEditStart(){
		copyObject =  Object.assign({}, _active_preview) as SystemPreview;
		copyObject.systemName += ' (copy)';
		copyObject.systemCodeName += 'copy';
	} 

	function createCall ( sys:SystemPreview ) {
		return api.systemDefinition.CreateNewSystem( sys );
	}

	function copyCall ( sys:SystemPreview ) { 
		return api.systemDefinition.CopySystem( _active_preview, sys );
	}
	
	function editCall ( sys:SystemPreview ) {
		return api.systemDefinition.EditSystem( sys );
	}
	

	/*
		onMount(() => {
		
		})

		function onPreviewSelected(){}

		// CREATE FUNCTIONALITY 
		async function onCreateNewSystem_START(){
			state = SystemSelectorStates.create;
		} 
		async function onCreateNewSystem_END( result : SystemPreview | null ){
			state = SystemSelectorStates.preview;
		}  



		// COPY FUNCTIONALITY 
		let copyObject : SystemPreview;
		async function onCopyNewSystem_START(){
			copyObject =  Object.assign({}, _active_preview) as SystemPreview;
			copyObject.systemName += ' (copy)';
			copyObject.systemCodeName += 'copy';
			state = SystemSelectorStates.copy;
		} 
		async function onCopyNewSystem_END( newCopy : SystemPreview | null ){
			state = SystemSelectorStates.preview;
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
	*/
</script>
<div>
	{#if loaded}
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
									bind:this={editList}
									isEditableContainer={false}
									collection={previews.map( p => {return {key : p.filePath , value : p.systemName} })}
									onSelect={ onSelectSystem }
									onAdd={ () => { state = SystemSelectorStates.create; } }
									on:onDeSelect={ () => { _active_preview = new SystemPreview() }}
								/> 
							{/key}
						</div>
					</div>
					<div>
						{#key _active_preview }
							{#if _active_preview.filePath}
								<div transition:slide >
									<button on:click={ () => { dispatch('onLoadSystem', _active_preview ) }}> Load System 	</button>
									<button on:click={ () => { onEditStart(); state = SystemSelectorStates.copy; } }> Copy System 	</button>
									{#if _active_preview.isEditable } <button> Delete System	</button> {/if}
									{#if _active_preview.isEditable } <button on:click={ () => { onEditStart(); state = SystemSelectorStates.edit; } }> Edit System	</button> {/if}
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
								onCreateCall={ createCall }
								on:onSelect={ ( e ) => { } }
								on:onStateEnd={ () => {state = SystemSelectorStates.preview } } 
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
								onCreateCall={ copyCall }
								on:onSelect={ 
									( e ) => { 
										let data;
										data = e.detail ;
										previews.push( data ) ;
										previews = previews;
										setTimeout( () => {editList.select( data.filePath )} , 250 )
									}
								}
								on:onStateEnd={ () => {state = SystemSelectorStates.preview } } 
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
								onCreateCall={ copyCall }
								on:onSelect={ ( e ) => { } }
								on:onStateEnd={ () => {state = SystemSelectorStates.preview } } 
							/>
						</div> 
					</div> 
				</div>
			{/if}
		</div>
	{:else if loadingFailed}
		<div>
			<p>loading Failed!</p>
			<StaticMessageHandler 
				bind:this={ loadingFailedmsgHandler }
			/>
		</div>
	{:else} 
		<div>
			<p>Loading...</p>
		</div>
	{/if}
</div>