<script lang="ts">
	
    import { onMount } from "svelte"; 
    
	import SystemSelector from "./SystemSelector/SystemSelector.svelte";
	import './app.scss' 
    import { ObsidianUICoreAPI } from "../../../../../src/Modules/ObsidianUICore/API";
    import StaticMessageHandler from "./BaseComponents/Messages/StaticMessageHandler.svelte";
    import { SystemPreview } from "../../../../../src/Modules/ObsidianUICore/model/systemPreview"; 
    import MainMenuButton from "./Menu/MainMenuButton.svelte";
    import SystemDesigner from "./SystemDesigner/SystemDesigner.svelte";
    import { writable, type Writable } from "svelte/store";
 

	
	const SystemEditorStates = {
		selector :"selector",
		designer :"designer"
	}
	let state = SystemEditorStates.selector;


	// data from subviews
	let selectedSystemPreview : Writable<SystemPreview> = writable();

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
			selected = { state == SystemEditorStates.selector }
			onClick = { () => { changeState(SystemEditorStates.selector) }  }
		/>
		<MainMenuButton 
			selected = { state == SystemEditorStates.designer }
			onClick = {  () => { changeState(SystemEditorStates.designer ) }  }
		/>
	</div>
	<div class="AppMainContent">
		{#if state == SystemEditorStates.selector}
			<div class="lineBreak" ></div>
			<SystemSelector 
				on:onLoadSystem={(e)=>{
					let a = e.detail; 
					let b = {}
					Object.assign(b, a)
					selectedSystemPreview.set( b );
					state = SystemEditorStates.designer;  
				}} 
			/> 
		{:else if state == SystemEditorStates.designer }
			<SystemDesigner 
				systemPreview={selectedSystemPreview}
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