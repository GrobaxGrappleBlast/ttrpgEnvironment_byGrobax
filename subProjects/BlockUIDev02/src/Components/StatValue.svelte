<script lang="ts">
    import { onDestroy, onMount } from "svelte";
	import { TNode } from '../../declaration'; 
    import { keyManager } from "../Structure/ComponentNode";
 

	export let name:string;
	export let statNode:TNode; 
	export let modNode:TNode; 
	export let editmode = false;  
	 
	let nodeValue = statNode.getValue();
	let modNodeValue = modNode.getValue();
	const KEY = keyManager.getNewKey(); 

	onMount( () => {
		statNode.addUpdateListener('onDerivedNodeUpdate' + KEY, onDerivedOrFixedNodeUpdate )
		modNode.addUpdateListener('onDerivedNodeUpdate' + KEY, onDerivedOrFixedNodeUpdate )
	})
	onDestroy(()=>{
		statNode.removeUpdateListener('onDerivedNodeUpdate' + KEY )
		modNode.removeUpdateListener('onDerivedNodeUpdate' + KEY  )
	})

	function onDerivedOrFixedNodeUpdate(){  
		nodeValue	 = statNode.getValue();
		modNodeValue = modNode.getValue();
	}

	function onChange(){
		let value = parseInt(statValueDiv.value);
		statNode.setValue(value);
	}

	let statValueDiv:  HTMLInputElement;
</script>


<div class="StatValue" >

	<div class="statTitle" > 
		{name}
	</div> 

	<div class="LargeValue" >
		<input 
			class="BoxValue" 
			data-editmode={editmode} 
			disabled={!editmode} 
			on:change={ onChange } 
			bind:this={ statValueDiv }
			value={ nodeValue }
			type="number"
			min="0"
			max="100"
		> 
	</div>

	<div class="SmallValue">
		<div class="BoxValue" >
			{ modNodeValue }
		</div> 
	</div>
	 
</div>

 