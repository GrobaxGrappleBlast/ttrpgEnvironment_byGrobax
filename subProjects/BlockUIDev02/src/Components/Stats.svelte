<script lang="ts"> 
	import { system } from '../../declaration'; 
	import StaticValue from "./StatValue.svelte"; 
	
	export let sys:system; 
	export let edit = false;  
	let stats = sys.getNodeNames('fixed','stats');
	
</script>
<div class="StatsRow" > 
	{#each stats as key}
		{@const node	= sys.getNode('fixed','stats',key)}
		{@const modNode	= sys.getNode('derived','modifiers',key)}
		<StaticValue
			name={key}	
			statNode={node}
			{modNode}
			editmode={edit}
		/>
	{/each}
</div>