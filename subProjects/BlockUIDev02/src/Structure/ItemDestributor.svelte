<script context="module" lang="ts">
	export enum viewNameIndex {
		HitPoints		 = "HitPoints"		,
		ProficiencyBonus = "ProficiencyBonus",
		SkillProficiencies = "SkillProficiencies",
		SpellInfo		 = "SpellInfo"		,
		Stats		 = "Stats"		
	}
</script>
<script lang="ts">
    import HitPoints from "../Components/HitPoints.svelte";
    import ProficiencyBonus from "../Components/ProficiencyBonus.svelte";
    import SkillProficiencyCollection from "../Components/SkillProficiencyCollection.svelte";
    import SpellInfo from "../Components/SpellInfo.svelte";
    import Stats from "../Components/Stats.svelte";
    import { system } from "../devDependency/declaration";
	import { CNode } from "./ComponentNode";
	
	export let data :CNode;
	export let editMode : boolean;
	export let sys : system;

</script>
<div>
	{#if 		data.type == viewNameIndex.HitPoints		}
		<HitPoints 
			sys={sys}
			editMode={editMode}
			playMode={false}
			data={data.data}
		/>
	{:else if	data.type == viewNameIndex.ProficiencyBonus	}
		<ProficiencyBonus 
			sys={sys}
			editMode={editMode} 
			data={data.data}
		/>
	{:else if	data.type == viewNameIndex.SkillProficiencies	}
		<SkillProficiencyCollection 
			edit={editMode} 
			sys={sys}
			data={data.data}
		/>
	{:else if	data.type == viewNameIndex.SpellInfo		}
		<SpellInfo 
			edit={editMode} 
			sys={sys}
			data={data.data}
		/>
	{:else if	data.type == viewNameIndex.Stats		}
		<Stats
			edit={editMode} 
			sys={sys}
			data={data.data}
		/>
	{/if}
	
</div>