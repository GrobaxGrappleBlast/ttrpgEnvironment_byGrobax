<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { system, TNode } from "../devDependency/declaration";
    import { CNode } from "../Structure/ComponentNode";
    import ItemOptions from "../Structure/ItemOptions.svelte";

	export let sys : system;	
	export let editMode:boolean;
	export let data :CNode;

	let node: TNode = sys.fixed.generic["Proficiency Bonus"];
	let v = node.getValue();

	onMount(()=>{ 
		node.addUpdateListener( name+'SvelteView' , ()=>{
			v = node.getValue();
		})
	})
	onDestroy(()=>{
		node.removeUpdateListener( name+'SvelteView');
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