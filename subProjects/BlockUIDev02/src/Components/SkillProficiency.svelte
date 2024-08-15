
<script lang="ts">
	import { system, TNode } from "../devDependency/declaration";
    import { onDestroy, onMount } from "svelte";
	
	export let edit:boolean;
	export let name:string;
	export let sys:system;

	let node_skill:TNode = sys.fixed.SkillProficiencies[name];
	let node_bonus:TNode = sys.derived.skillproficiencyBonus[name];
	
	let value = node_skill.getValue();
	let bonus = node_bonus.getValue();
	onMount(()=>{ 
		node_skill.addUpdateListener( name+'SvelteView' , ()=>{
			value = node_skill.getValue();
		})
		node_bonus.addUpdateListener( name+'SvelteView' , ()=>{
			bonus = node_bonus.getValue();
		})
	})
	onDestroy(()=>{
		node_skill.removeUpdateListener( name+'SvelteView');
		node_bonus.removeUpdateListener( name+'SvelteView');
	})

	function iterateValue(){ 

		if (!edit){
			return;
		}

		let value = node_skill.getValue();
		value = (value + 1 ) % 3;
		node_skill.setValue(value);
		return null
	}

</script>


<div class="skillproficiencyContainer" data-edit={edit}>
	<div class="skillproficiencyMarkParent" >
		<div 
			class="skillproficiencyMark" 
			data-level={value} 
			on:keyup 
			on:click={ iterateValue }>
		</div>
	</div>
	<div class="skillproficiencyMarkName" >
		<p>{name}</p>
	</div>
	<div class="skillproficiencyMarkValue" > 
		<p>{bonus}</p>
	</div>
  </div>