<script lang="ts">
	import { slide } from 'svelte/transition';
    import { system } from "../../declaration";
	import { CNode } from "./ComponentNode";
    import ItemOptions from "./ItemOptions.svelte";
    import { viewNameIndex } from "./ViewNameIndex";
    import ItemManouver from './ItemManouver.svelte';
    import MyView from '../Components/MyView.svelte';
	
	export let data :CNode;
	export let editMode : boolean;
	export let sys : system; 
	export let length : number; 
	export let index : number;
	export let layoutMode:boolean = false;

	function updateData(){ 
		data = data; 
	}

</script>
<div>
	
	{#if editMode}
		<ItemOptions 
			bind:data={data}
			editMode={true}
			on:optionSelected={updateData}
		/>
	{/if}
	{#if length != 1}
		<ItemManouver
			bind:data={data}
			editMode={layoutMode} 
			hasDown	={ index != length-1 }
			hasUp	={ index != 0 }
			on:moveUp		
			on:moveDown	
		/>
	{/if}
	{#if data.type == viewNameIndex.MyView		}
		<div transition:slide  >
			<MyView 
				sys={sys}
				editMode={editMode} 
				bind:data={data} 
				on:optionSelected={updateData}
			/>
		</div>
	{:else if	data.type == viewNameIndex.MyOtherView		}
		<!-- Implment another view here -->
	{/if}
 
</div>