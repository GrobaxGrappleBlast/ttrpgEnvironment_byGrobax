<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { system, TNode } from "../devDependency/declaration";

	
	//	export let node: TNode;
	export let sys : system; 
	export let editMode:boolean;
	export let playMode:boolean;
	export let data:object;
	
	let node=sys.fixed.generic["Hit Points"];
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
	<div>Hit Points</div>
	<input type="number" disabled={!editMode} bind:value={v} on:change={iterateValue}>

	<div>temporary Hit Points</div>
	<input type="number" >

	{#if editMode}
		<!-- When editing we use the Actual Hit Point Maximum -->
		<div>Hit Point Maximum</div>
		<input type="number" >
	{:else if playMode}
		<!-- When we are Playing we use the "game current" hitpoint Maximum -->
		<div>Hit Point Maximum</div>
		<input type="number" >
	{:else}
		<!-- when we are in preview mode we use the Actual Hit Point Maximum -->
		<div>Hit Point Maximum</div>
		<input type="number" >
	{/if}
</div>