<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { TNode } from "../devDependency/declaration";


	export let SpellDC		: Record<string,TNode>;
	export let SpellBonus	: Record<string,TNode>;
	let DCs		= Object.values(SpellDC);
	let Bonus	= Object.values(SpellBonus);
	let keys    = Object.keys(SpellDC);

	let sortSelect : HTMLSelectElement;

	export let editMode:boolean; 
	export let showStat:string = keys[0]; 
	let chosen_DC		= SpellDC	[showStat].getValue();
	let chosen_BONUS	= SpellBonus[showStat].getValue();

	function changeSort(){
		let value = sortSelect.value;
		showStat		= value; 
		chosen_DC		= SpellDC	[showStat].getValue();
		chosen_BONUS	= SpellBonus[showStat].getValue();
	}
	function update(){
		chosen_DC		= SpellDC	[showStat].getValue();
		chosen_BONUS	= SpellBonus[showStat].getValue();
	} 
	onMount(()=>{ 
		DCs.forEach(node => {
			node.addUpdateListener( name+'SpellInfoView' , ()=>{
				update()
			})
		});
		Bonus.forEach(node => {
			node.addUpdateListener( name+'SpellInfoView' , ()=>{
				update()
			})
		});
		changeSort();
	})
	onDestroy(()=>{
		DCs.forEach(node => {
			node.removeUpdateListener( name+'SpellInfoView' )
		});
		Bonus.forEach(node => {
			node.removeUpdateListener( name+'SpellInfoView' )
		});
	}) 
	
</script>
<div>
	{#if editMode }
		<div>
			<select bind:this={sortSelect} on:change={ changeSort }>
				{#each keys as key }
					<option value={key} selected={ key == showStat}> {key} </option>
				{/each}
			</select>
		</div>
	{:else}
		<div> 
		</div>
	{/if}

	<div class="spellDCContainer">
		<div>{showStat}</div>
		<div>
			<div>Spell DC</div>
			<div>{chosen_DC}</div>
		</div>

		<div>
			<div>Spell Bonus</div>
			<div>{chosen_BONUS}</div>
		</div>
	</div>
</div>