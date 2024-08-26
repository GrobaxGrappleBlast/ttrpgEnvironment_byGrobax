
<script lang="ts">
	import SkillProficiency from './SkillProficiency.svelte'; 
	import { system, TNode } from "../../declaration"; 
    import { CNode } from '../Structure/ComponentNode';
    import ItemOptions from '../Structure/ItemOptions.svelte';
	
	export let edit:boolean; 
	export let sys:system;
	export let data :CNode; 

	let names = Object.keys(sys.fixed.SkillProficiencies);

</script>


<div class="skillproficiencyCollection" data-edit={edit}>
	{#each names as name }
		<SkillProficiency 
			edit={edit}
			name={name}
			sys={sys}
		/>	
	{/each} 
</div>