<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { system, TNode } from "../../declaration";
    import { CNode, keyManager } from "../Structure/ComponentNode";
    import ItemOptions from "../Structure/ItemOptions.svelte";

	export let sys : system;	
	export let editMode:boolean;
	export let data :CNode;

	let node: TNode = sys.getNode('fixed','generic','Proficiency Bonus');
	let v = node.getValue();
	const KEY = keyManager.getNewKey();

	onMount(()=>{ 
		node.addUpdateListener( name+KEY+'SvelteView' , ()=>{
			v = node.getValue();
		})
	})
	onDestroy(()=>{
		node.removeUpdateListener( name+KEY+'SvelteView');
	})

	function iterateValue(){ 
		node.setValue(v);
		return null
	}

</script>
<div class="ProficiencyBonus" >
	<div>Proficiency Bonus</div>
	<input type="number" disabled={!editMode} bind:value={v} on:change={iterateValue}>
</div>