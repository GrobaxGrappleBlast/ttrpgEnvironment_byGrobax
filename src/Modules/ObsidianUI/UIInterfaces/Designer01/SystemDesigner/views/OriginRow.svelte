<script lang="ts">

	import CustomSelect from "../../BaseComponents/CustomSelect/CustomSelect.svelte";
	import './OriginRow.scss';
	import { GrobDerivedNode, TTRPGSystem, GrobFixedNode, GrobDerivedOrigin , type GrobNodeType } from "../../../../../Designer";
	import Trash from '../../BaseComponents/buttons/trash.svelte';
    import { createEventDispatcher, onMount } from "svelte";  
    import { slide } from "svelte/transition";
	
	export let system:TTRPGSystem;
	type originRowData = {key: string, segments:(string|null)[] , active :boolean , testValue :number, inCalc:boolean, target: GrobNodeType | null };
	export let rowData : originRowData;
	export let availableSymbols : string [] = []; 
	

	let dispatch = createEventDispatcher();

	onMount(()=>{  
		if (origin && rowData.segments ){ 
			if(!(rowData.segments[0])){
				return
			}
			options_level1 = system.data[rowData.segments[0]].getCollectionsNames() ?? [];
			if(!rowData.segments[1]){
				return
			}
			options_level2 = system.data[rowData.segments[0]].getCollection(rowData.segments[1]).getNodeNames() ?? [] ;
		}
	})

	
	let options_level0 :string[] = ['fixed','derived'];
	let options_level1 :string[] = [];
	let options_level2 :string[] = [];

	function onSelect( level : number , value : string ){
		switch(level){
			case 0:

				options_level1 = system.data[value].getCollectionsNames();
				rowData.segments[1] = null;
				rowData.segments[2] = null;
				options_level2 =[];
				if (origin){
					dispatch('deselectTargetNode');
				}
				rowData.target = null;
				break;
			case 1:
				//@ts-ignore
				options_level2 = system.getCollection(rowData.segments[0],value)?.getNodeNames();
				rowData.segments[2] = null;
				if (origin){
					dispatch('deselectTargetNode');
				}
				rowData.target = null;
				break;
			case 2:
				//@ts-ignore
				let targetNode = system.getNode(rowData.segments[0],rowData.segments[1],value);
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
				rowData.segments[1] = null;
				rowData.segments[2] = null;
				break;
			case 1:
				//@ts-ignore
				options_level2 = [];
				rowData.segments[2] = null;
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

	function fromPreOriginToOrigin(   ){ 
		console.log("asdasd");
		rowData.active = true;
		rowData.segments = (new Array(3).fill(null));   
	}

</script>
<div   >
	{#if rowData.active }
		<div class="derivedOriginRow" 	transition:slide|local  >
			<!-- The Symbol -->
			{#if availableSymbols.length == 0}
				<div class="derivedOriginRowInteractionField" >{rowData.key}</div>
			{:else}
				<CustomSelect selected={rowData.key} options={ [...availableSymbols, rowData.key] }	on:onSelect={(e) => {onChangeSymbol(e.detail)}} />
			{/if} 

			<!-- Test Value -->
			<input type="number" class="derivedOriginRowInteractionField" bind:value={rowData.testValue} />


			<!-- Selects -->
			<CustomSelect 
				bind:selected={rowData.segments[0] }
				options={ options_level0 }		
				on:onSelect={(e) => onSelect(0,e.detail)} 
				on:onDeselect={()=>onDeselect(0)} 
				/>
			<CustomSelect 
				bind:selected={rowData.segments[1]} 
				options={options_level1}	
				disabled={!(options_level0)}	
				on:onSelect={(e) => onSelect(1,e.detail)} 
				on:onDeselect={()=>onDeselect(0)} 
			/>
			<CustomSelect 
				bind:selected={rowData.segments[2]} 
				options={options_level2}	
				disabled={!(options_level1)}	
				on:onSelect={(e) => onSelect(2,e.detail)}
				on:onDeselect={()=>onDeselect(0)} 
			
			/>

			<!-- Deletes -->
			<div class="derivedOriginRowInteractionField" data-color={ rowData.inCalc ? 'verbose' : 'error' } on:click={ondelete} on:keydown={ondelete}>
				<Trash color={'white'}/>
			</div>
		</div>
	{:else}
		<div class="derivedOriginRow" on:click={fromPreOriginToOrigin} on:keydown={ fromPreOriginToOrigin } 	transition:slide|local >
			<div> {rowData.key} </div>
			<div></div>
			<div> Click To Add a Origin </div>
			
			{#if !rowData.inCalc }
				<!-- Deletes -->
				<div class="derivedOriginRowInteractionField" data-color={ rowData.inCalc ? 'verbose' : 'error' } on:click={ondelete} on:keydown={ondelete}>
					<Trash color={'white'}/>
				</div>
			{/if}
		</div>
	{/if} 
</div>