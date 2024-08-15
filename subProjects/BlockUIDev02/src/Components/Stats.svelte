<script lang="ts">
    import { onMount } from "svelte";
	import { system, TNode } from '../devDependency/declaration'; 
	import StaticValue from "./StatValue.svelte";

	export let sys:system;
	export let data:any;
	export let edit = false;  

	let stats = sys.fixed.stats;
</script>
<div style="grid-area:stat" class="Row" >
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