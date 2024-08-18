<script lang="ts">
	import { fly, slide } from 'svelte/transition';
    import HitPoints from "../Components/HitPoints.svelte";
    import ProficiencyBonus from "../Components/ProficiencyBonus.svelte";
    import SkillProficiencyCollection from "../Components/SkillProficiencyCollection.svelte";
    import SpellInfo from "../Components/SpellInfo.svelte";
    import Stats from "../Components/Stats.svelte";
    import { system } from "../devDependency/declaration";
	import { CNode } from "./ComponentNode";
    import ItemOptions from "./ItemOptions.svelte";
    import { viewNameIndex } from "./ViewNameIndex";
	
	export let data :CNode;
	export let editMode : boolean;
	export let sys : system;

	function updateData(){ 
		data = data; 
	}

</script>
<div>
	
	<ItemOptions 
		bind:data={data}
		editMode={editMode}
		on:optionSelected={updateData}
	/>
	{#if data.type == viewNameIndex.HitPoints		}
		<div transition:slide  >
			<HitPoints 
				sys={sys}
				editMode={editMode}
				playMode={false}
				bind:data={data} 
				on:optionSelected={updateData}
			/>
		</div>
	{:else if	data.type == viewNameIndex.ProficiencyBonus	}
		<div transition:slide  >
			<ProficiencyBonus 
				sys={sys}
				editMode={editMode} 
				bind:data={data} 
				on:optionSelected={updateData}
			/>
		</div>
	{:else if	data.type == viewNameIndex.SkillProficiencies	}
		<div transition:slide  >
			<SkillProficiencyCollection 
				edit={editMode} 
				sys={sys}
				bind:data={data} 
				on:optionSelected={updateData}
			/>
		</div>
	{:else if	data.type == viewNameIndex.SpellInfo		}
		<div transition:slide  >
			<SpellInfo 
				edit={editMode} 
				sys={sys}
				bind:data={data}
				on:optionSelected={updateData} 
			/>
		</div>
	{:else if	data.type == viewNameIndex.Stats		}
		<div transition:slide  >
			<Stats
				edit={editMode} 
				sys={sys}
				bind:data={data} 
				on:optionSelected={updateData}
			/>
		</div>
	{/if}
	
</div>