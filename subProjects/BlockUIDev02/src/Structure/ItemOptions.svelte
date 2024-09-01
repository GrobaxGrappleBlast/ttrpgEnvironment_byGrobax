<script lang="ts">
  
    import { createEventDispatcher  } from "svelte";
    import { type CNode } from "./ComponentNode";
    import { viewNameIndex } from "./ViewNameIndex";
    import CustomSelect from "../importedComponents/CustomSelect/CustomSelect.svelte";
	let dispatch = createEventDispatcher();
	
	export let data:CNode;
	export let editMode:boolean;
	let options = Object.keys(viewNameIndex)
	let selected = data.type;
	let tab : HTMLSelectElement;

 	function selectOption(){
		let v = tab.value;
		data.type = v;
		dispatch('optionSelected');
		console.log('optionSelected' , v)
	}
</script>
<div  class="ItemOptionsContainer" >
	<!--CustomSelect 
		options={options}
		selected={selected}
		on:onSelect={  selectOption }
		unSelectedplaceholder={(!data.type || data.type == 'NONE') ? 'Select View Type' : 'Select a new Type '} 
	/-->
	<div class="ItemOptions" >
		<div class="ItemOptionBtn "> 
			<select on:change={selectOption} bind:this={tab} >
				<option value={ null }> choose component </option> 
				{#each options as opt}
					<option value={opt} selected={selected == opt}> {opt} </option> 
				{/each}
			</select>		
		</div>
	</div>
</div>
