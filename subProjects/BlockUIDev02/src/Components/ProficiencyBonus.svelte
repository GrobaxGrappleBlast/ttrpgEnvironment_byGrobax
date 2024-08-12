<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { TNode } from "../devDependency/declaration";

	
	export let node: TNode;
	export let editMode:boolean;
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
<div>
	<div>Proficiency Bonus</div>
	<input type="number" disabled={!editMode} bind:value={v} on:change={iterateValue}>
</div>