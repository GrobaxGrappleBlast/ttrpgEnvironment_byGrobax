<script lang="ts">
    import { onMount } from "svelte";
	import { TNode } from '../devDependency/declaration'; 
 

	export let name:string;
	export let statNode:TNode; 
	export let modNode:TNode;
	export let editmode = false;  

	let nodeValue = statNode.getValue();
	let modNodeValue = modNode.getValue();
	onMount( () => {
		statNode.addUpdateListener('onDerivedNodeUpdate', onDerivedOrFixedNodeUpdate )
		modNode.addUpdateListener('onDerivedNodeUpdate' , onDerivedOrFixedNodeUpdate )
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

	<div> 
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

 