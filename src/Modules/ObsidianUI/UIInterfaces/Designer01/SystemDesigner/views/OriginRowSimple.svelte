<script lang="ts">

	import CustomSelect from "../../BaseComponents/CustomSelect/CustomSelect.svelte";
	import './OriginEditor.scss';
	import { GrobDerivedNode, TTRPGSystem, GrobFixedNode, GrobDerivedOrigin } from "../../../../../Designer";
	import Trash from '../../BaseComponents/buttons/Trash.svelte' 
    import { createEventDispatcher, onMount } from "svelte"; 
    import { type GrobNodeType } from "../../../../../Designer";
	
	export let system:TTRPGSystem;
	type originRowData = {key: string, segments:string[]|null , testValue :number, inCalc:boolean , target: GrobNodeType | null};
	export let rowData : originRowData;
	export let availableSymbols : string [] = []; 


	let dispatch = createEventDispatcher();

	onMount(()=>{
		if (origin){
			let segments : string[] = [];
			segments = rowData.segments ?? [];

			selectedLevel_0 = segments[0] ?? null;
			selectedLevel_1 = segments[1] ?? null;
			selectedLevel_2 = segments[2] ?? null;

			if(!selectedLevel_0){
				return
			}
			options_level1 = system.data[selectedLevel_0].getCollectionsNames();
			if(!selectedLevel_1){
				return
			}
			options_level2 = system.data[selectedLevel_0].getCollection(selectedLevel_1).getNodeNames();
		}
	})

	let selectedLevel_0 : string | null = null;
	let selectedLevel_1 : string | null = null;
	let selectedLevel_2 : string | null = null;
	
	let options_level0 :string[] = ['fixed','derived'];
	let options_level1 :string[] = [];
	let options_level2 :string[] = [];

	function onSelect( level : number , value : string ){
		switch(level){
			case 0:

				options_level1 = system.data[value].getCollectionsNames();
				selectedLevel_1 = null;
				selectedLevel_2 = null;
				options_level2 =[];
				if (origin){
					dispatch('deselectTargetNode');
				}
				rowData.target = null;
				break;
			case 1:
				//@ts-ignore
				options_level2 = system.getCollection(selectedLevel_0,value)?.getNodeNames();
				selectedLevel_2 = null;
				if (origin){
					dispatch('deselectTargetNode');
				}
				rowData.target = null;
				break;
			case 2:
				//@ts-ignore
				let targetNode = system.getNode(selectedLevel_0,selectedLevel_1,value);
				rowData.target =targetNode;
				dispatch('foundTargetNode',targetNode);
				break;
		}
	}

	function onDeselect( level : number){
		if (origin){
			dispatch('deselectTargetNode');
		}
		switch (level){
			case 0: 
				options_level1 = [];
				options_level2 =[];
				rowData.target = null;
				selectedLevel_1 = null;
				selectedLevel_2 = null;
				break;
			case 1:
				//@ts-ignore
				options_level2 = [];
				selectedLevel_2 = null;
				rowData.target = null;
				break;
			case 2:
				//@ts-ignore
				targetNode = null;
				break;
		}
	}

	function ondelete(){
		dispatch('onDelete',rowData.key)
	}

	function onChangeSymbol( s ){
		dispatch('onSymbolSelected',{old:rowData.key, new:s })
	}

</script>
<div class="derivedOriginRow" >
	<!-- The Symbol -->
	{#if availableSymbols.length == 0}
		<div class="derivedOriginRowInteractionField" >{rowData.key}</div>
	{:else}
		<CustomSelect selected={rowData.key} options={ [...availableSymbols, rowData.key] }	on:onSelect={(e) => {onChangeSymbol(e.detail)}} />
	{/if} 

	<!-- Test Value -->
	<input type="number" class="derivedOriginRowInteractionField" bind:value={rowData.testValue} />


	<!-- Selects -->
	<CustomSelect bind:selected={selectedLevel_0} options={ options_level0 }		on:onSelect={(e) => onSelect(0,e.detail)} on:onDeselect={()=>onDeselect(0)} />
	{#key options_level1}
		<CustomSelect bind:selected={selectedLevel_1} options={options_level1}		on:onSelect={(e) => onSelect(1,e.detail)} on:onDeselect={()=>onDeselect(0)} disabled={ options_level1.length == 0 }/>
	{/key}
	{#key options_level2}
		<CustomSelect bind:selected={selectedLevel_2} options={options_level2}		on:onSelect={(e) => onSelect(2,e.detail)} on:onDeselect={()=>onDeselect(0)} disabled={ options_level2.length == 0 }/>
	{/key}

	<!-- Deletes -->
	<div class="derivedOriginRowInteractionField" data-color={ rowData.inCalc ? 'verbose' : 'error' } on:click={ondelete} on:keydown={ondelete}>
		<Trash color={'white'}/>
	</div>
</div>