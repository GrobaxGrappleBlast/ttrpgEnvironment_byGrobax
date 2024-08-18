<script lang="ts">
    import { onMount } from "svelte";
	import { system, TNode } from '../devDependency/declaration'; 
	import StaticValue from "./StatValue.svelte";
    import { CNode } from "../Structure/ComponentNode";
    import ItemOptions from "../Structure/ItemOptions.svelte";

	export let sys:system;
	export let data :CNode;
	export let edit = false; 

	let stats = sys.fixed.stats;
</script>
<div class="StatsRow" > 
	<ItemOptions 
		data={data}	
		editMode={edit}
		on:optionSelected
	/>
	{#each Object.keys(stats) as key}
		{@const node = stats[key]}
		{@const modNode = sys.derived.modifiers[key]}
		<StaticValue
			name={key}
			statNode={node}
			{modNode}
			editmode={edit}
		/>
	{/each}
</div>