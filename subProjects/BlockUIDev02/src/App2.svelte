<script lang="ts">
    import { onMount } from "svelte";
	import SkillProficiency from "./Components/SkillProficiency.svelte";
	import StaticValue from "./Components/StatValue.svelte";
	import "./app2.scss";
	import { system, TNode } from "./devDependency/declaration";
	import { tooltip } from "./importedComponents/tooltip/toolTip.js";
    import ProficiencyBonus from "./Components/ProficiencyBonus.svelte";
    import HitPoints from "./Components/HitPoints.svelte";
    import ToogleSection from "./importedComponents/ToogleSection.svelte";
    import SpellInfo from "./Components/SpellInfo.svelte";
    import { derived } from "svelte/store";

	let sys = new system();
	let stats = sys.fixed.stats;

	let editMode = false;

	function toogleEditMode(save = false) {
		editMode = !editMode;
	}

	function testSetUp(){
		sys.fixed.stats.charisma	.setValue(10 )	;
		sys.fixed.stats.constitution.setValue(10 +2);
		sys.fixed.stats.dexterity	.setValue(10 +4);
		sys.fixed.stats.intelligence.setValue(10 +6)	;
		sys.fixed.stats.strength	.setValue(10 +2);
		sys.fixed.stats.wisdom		.setValue(10 +4);

		let _ = Object.keys(sys.fixed.SkillProficiencies);
		for (let i = 0; i < _.length; i++) {
			const key = _[i];
			const prof = Math.floor(Math.random() * 3);
			sys.fixed.SkillProficiencies[key].setValue(prof);
		}

		sys.fixed.generic["Proficiency Bonus"].setValue(2);
		sys.fixed.generic["Hit Points"].setValue(50);
	}
	onMount(()=>{
		testSetUp();
	})
</script>

<div class="Sheet">
	<div class="Header">
		<div class="HeaderMenu">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				use:tooltip={{ text: "Turn On Edit Mode", type: "verbose" }}
				on:click={() => toogleEditMode()}
			>
				edit
			</div>
			<div
				use:tooltip={{ text: "Save Changes To File", type: "verbose" }}
			>
				saveChanges
			</div>
			<div use:tooltip={{ text: "Reload", type: "verbose" }}>reload</div>
		</div>
	</div>
	<div class="DndPersonSetupGrid" >
		<div style="grid-area:stat" class="Row" >
			{#each Object.keys(stats) as key}
				{@const node = stats[key]}
				{@const modNode = sys.derived.modifiers[key]}
				<StaticValue
					name={key}
					statNode={node}
					{modNode}
					editmode={editMode}
				/>
			{/each}
		</div>
		<div style="grid-area:prof">
			
				{#each Object.keys(sys.fixed.SkillProficiencies) as skill}
					<SkillProficiency
						edit={editMode}
						name={skill}
						node_skill={sys.fixed.SkillProficiencies[skill]}
						node_bonus={sys.derived.skillproficiencyBonus[skill]}
					/>
				{/each} 
			
		</div>
		<div style="grid-area:profB">
			<ProficiencyBonus
				node={sys.fixed.generic["Proficiency Bonus"]}
				editMode={editMode}
			/>
		</div>
		<div style="grid-area:hp">
			<HitPoints
				node={sys.fixed.generic["Hit Points"]}
				editMode={editMode}
				playMode={false}
			/>
		</div>
		<div style="grid-area:spell">
			<SpellInfo 
				SpellDC		= {sys.derived['Spell Bonus']}
				SpellBonus	= {sys.derived['Spell DC']}
				editMode	= {editMode} 
			/>
		</div>
	</div>

</div>
