<script lang="ts">
	import SystemExporter from './SystemExporter/SystemExporter.svelte'; 
	import SystemSelector from "./SystemSelector/SystemSelector.svelte";
	import './app.scss' 
    import { ObsidianUICoreAPI } from "../../../../../src/Modules/ObsidianUICore/API";
    import { SystemPreview } from "../../../../../src/Modules/ObsidianUICore/model/systemPreview";  
    import { writable, type Writable } from "svelte/store";
    import SystemDesignerContainer from "./SystemDesigner/SystemDesignerContainer.svelte";
    import { slide } from 'svelte/transition';
    import MainMenuButton from './Menu/MainMenuButton.svelte';
 

	
	const SystemEditorStates = {
		selector :"selector",
		designer :"designer",
		exporter :"exporter"
	}
	let state = SystemEditorStates.selector;


	// data from subviews
	let selectedSystemPreview	: Writable<SystemPreview> = writable();
	let selectedSystem		 	: Writable<TTRPGSystem> = writable();
	
	async function onPreviewSelected( preview : SystemPreview ){
		selectedSystemPreview.set( preview );
		let resp =  await ( ObsidianUICoreAPI.getInstance()).systemFactory.getOrCreateSystemFactory( preview ); 
		if (resp.responseCode >= 200 && resp.responseCode <= 300 && resp.response ){
			let o = resp.response;
			selectedSystem.set( o );
			state = SystemEditorStates.designer;  
		}else{
			console.error('tried to fetch TTPRGSystem, but something went wrong');
		} 
	}
	function changeState( nstate ){
		
		if(state == nstate)	
			return;
		
		state = nstate;
		switch(state){
			
			// if reselectign the selector
			case  SystemEditorStates.selector : 
				break;

			// if selecting the Designer 
			case  SystemEditorStates.designer :
				break;
		}
	 
	}
	
	

</script>
<div class="MainAppContainer" >
	<div class="AppMainMenu">
		<MainMenuButton 
			text = { SystemEditorStates.selector }
			selected = { state == SystemEditorStates.selector }
			onClick = { () => { changeState(SystemEditorStates.selector) }  }
		/>
		<MainMenuButton 
			text = { SystemEditorStates.designer }
			selected = { state == SystemEditorStates.designer }
			onClick = {  () => { changeState(SystemEditorStates.designer ) }  }
		/>
		<MainMenuButton 
			text = { SystemEditorStates.exporter }
			selected = { state == SystemEditorStates.exporter }
			onClick = {  () => { changeState(SystemEditorStates.exporter ) }  }
		/>
	</div>
	<div class="AppMainContent">
		<div class="lineBreak" ></div>
		{#if state == SystemEditorStates.selector} 
			<SystemSelector 
				on:onLoadSystem={ async (e)=>{
					let a = e.detail; 
					onPreviewSelected(a);
				}} 
			/> 
		{:else if state == SystemEditorStates.designer }
			<div transition:slide|local >
				<SystemDesignerContainer 
					preview={selectedSystemPreview}
					system={selectedSystem}
				/> 
			</div>
		{:else if state == SystemEditorStates.exporter }
			<SystemExporter 
				preview={selectedSystemPreview}
				system={selectedSystem}
			/> 
		{/if}
	</div>
</div>

<style>
	
.AppMainMenu{
	display: grid;
	grid-template-columns: 60px 60px 60px;
}
</style>