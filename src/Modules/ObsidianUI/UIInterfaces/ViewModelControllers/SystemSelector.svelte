
<script lang="ts">
   
    import { writable ,type Writable } from "svelte/store";
	import { slide,fly, fade } from "svelte/transition";  
	import { slidefade } from '../Designer01/Transitions/SlideFly';
	
	import StopIcon from '../Designer01/BaseComponents/buttons/stop.svelte';
    import { onMount } from "svelte"; 
    // import { SystemDesigner2Controller } from "./SystemDesigner2Controller";
    // import EditableCollection2 from "./EditableCollection2.svelte";
    // import { recursiveFindNewName } from "./functions";
    // import { FactoryContainer } from "../../modules/SystemDesigner/core/FactoryContainer";

	// export let availableSystems	: Writable<DefinedSystems[]>
	// export let systemNames		: Writable<string[]>
	// export let activeSystem		: Writable<DefinedSystems | null >
		
	onMount( ()=>{
		 
	})

	// EDIT CONTROLS 
	let activeSystemIsEdited = false;
	let editName = '';
	let editAuth = ''; 
	
 
	function toogleEdit( state = null ){
 
	}
	
	function onSystemClicked( name ){
 
	}
 
	let sysNameError = false;
	async function onEditSystemName(e){
	 
	} 

	async function onEditSystemAuthorName(e){
		 
	}

	async function onSaveSystem(){
	}

	let isCreatingSystem = false;
	function onCreation() {
		 
    }
	
</script>
<div>
	<div>
		<h4>Welcome to The System Designer</h4>
		<p> This is where you can inspect, and design ned TTRPG Systems.
		To Begin please, click an Option Below or Create a New System</p>
		<!--EditableCollection2 
			items = { $systemNames.map( p => { return { name:p } })}
			onAdd = { onCreation  }
			onSelect = { onSystemClicked }
		/-->
	</div>
	
	 
</div> 