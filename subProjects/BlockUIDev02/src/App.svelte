<script lang="ts">
    import { onMount } from "svelte";
	import SkillProficiency from "./Components/SkillProficiency.svelte";
	import StaticValue from "./Components/StatValue.svelte";
	import "./app.scss";
	import { system, TNode } from "./devDependency/declaration";
	import { tooltip } from "./importedComponents/tooltip/toolTip.js";

	let sys = new system();
	let stats = sys.fixed.stats;

	let editMode = false;

	function toogleEditMode(save = false) {
		editMode = !editMode;
	}
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
	<div class="Row">
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
	<div>
		<div class="Column">
			{#each Object.keys(sys.fixed.SkillProficiencies) as skill}
				<SkillProficiency
					edit={editMode}
					name={skill}
					node_skill={sys.fixed.SkillProficiencies[skill]}
					node_bonus={sys.derived.skillproficiencyBonus[skill]}
				/>
			{/each}
		</div>
	</div>
</div>
