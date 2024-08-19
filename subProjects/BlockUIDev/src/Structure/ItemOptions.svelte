<script lang="ts">
    import { slide } from "svelte/transition";

    import { createEventDispatcher, onMount } from "svelte";
    import { CNode } from "./ComponentNode";
    import { viewNameIndex } from "./ViewNameIndex";
    import CustomSelect from "../importedComponents/CustomSelect/CustomSelect.svelte";
	let dispatch = createEventDispatcher();
	
	export let data:CNode;
	export let editMode:boolean;
	let options = Object.keys(viewNameIndex)
	let selected = data.type;

 	function selectOption(a){
		let option = a.detail;
		
		data.type = option;
		dispatch('optionSelected');
		console.log('optionSelected' + option)
		 
	}
</script>
<div  class="ItemOptionsContainer" >
	<div class="ItemOptions" >
		<div class="ItemOptionBtn "> 
			<CustomSelect 
				options={options}
				selected={selected}
				on:onSelect={  selectOption }
				unSelectedplaceholder={(!data.type || data.type == 'NONE') ? 'Select View Type' : 'Select a new Type '} 
			/>
		</div>
	</div>
</div>
