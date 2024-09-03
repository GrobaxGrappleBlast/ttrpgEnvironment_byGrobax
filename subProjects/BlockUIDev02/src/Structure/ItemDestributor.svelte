<script lang="ts">
	import { fly, slide } from 'svelte/transition';
    import HitPoints from "../Components/HitPoints.svelte";
    import ProficiencyBonus from "../Components/ProficiencyBonus.svelte";
    import SkillProficiencyCollection from "../Components/SkillProficiencyCollection.svelte";
    import SpellInfo from "../Components/SpellInfo.svelte";
    import Stats from "../Components/Stats.svelte";
    import { system } from "../../declaration";
	import { CNode } from "./ComponentNode";
    import ItemOptions from "./ItemOptions.svelte";
    import { viewNameIndex } from "./ViewNameIndex";
    import ItemManouver from './ItemManouver.svelte'; 
	
	export let data			: CNode		;
	export let editMode 	: boolean	;
	export let sys			: system	; 
	export let length		: number	; 
	export let index		: number	;
	export let layoutMode	: boolean = false;
	let redrawIndex = 0;

	function updateData( v ){ 
		console.log( data ) 
		data = data;
		redrawIndex++;
	}

</script>
<div data-name="ItemDestributor" class="itemDestributer" >
	
		{#if editMode}
			<ItemOptions 
				bind:data={data}
				editMode={true}
				on:optionSelected={updateData}
			/>
		{/if}
		 
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
					on:optionSelected={updateData}
				/>
			</div>
		{/if}
	
</div>