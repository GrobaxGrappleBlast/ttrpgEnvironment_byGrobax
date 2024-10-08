<script lang="ts">
   
	import './OriginRow.scss';
    import { createEventDispatcher, onMount } from "svelte";  
    import { slide } from "svelte/transition";
    import CustomSelect						from '../../../../../../../src/Modules/ui/Components/CustomSelect/CustomSelect.svelte';
    import Trash							from '../../../../../../../src/Modules/ui/Components/buttons/trash.svelte';
	import { GrobJNodeType, TTRPGSystemJSONFormatting }	from '../../../../../../../src/Modules/graphDesigner';	


	
	export let system:TTRPGSystemJSONFormatting; 
	type originRowData = {key: string, segments:(string|null)[] , active :boolean , testValue :number, inCalc:boolean, target: GrobJNodeType  | null , isSelectAllTarget:boolean };
	export let rowData : originRowData;
	export let availableSymbols : string [] = []; 
	export let allowSelectAll : boolean = false; 
	export let SelectAllText = '--Select All--'

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
		rowData.isSelectAllTarget = false;
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

				if (allowSelectAll && options_level2.length != 0 ){
					options_level2 = [ SelectAllText , ...options_level2 ];
				}

				rowData.segments[2] = null;
				if (origin){
					dispatch('deselectTargetNode');
				}
				rowData.target = null;
				break;
			case 2:

				if (allowSelectAll && value === SelectAllText){  
					 
					rowData.isSelectAllTarget = true;
					dispatch('foundSelectAllTargetNode' ); 
					return;
				}
				
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

	function onChangeSymbol( s:any ){
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
			<div class="derivedOriginRowInteractionField" role="none" data-color={ rowData.inCalc ? 'verbose' : 'error' } on:click={ondelete} on:keydown={ondelete}>
				<Trash color={'white'}/>
			</div>
		</div>
	{:else}
		<div class="derivedOriginRow" on:click={fromPreOriginToOrigin} role="none" on:keydown={ fromPreOriginToOrigin } 	transition:slide|local >
			<div> {rowData.key} </div>
			<div></div>
			<div> Click To Add a Origin </div>
			
			{#if !rowData.inCalc }
				<!-- Deletes -->
				<div class="derivedOriginRowInteractionField" role="none" data-color={ rowData.inCalc ? 'verbose' : 'error' } on:click={ondelete} on:keydown={ondelete}>
					<Trash color={'white'}/>
				</div>
			{/if}
		</div>
	{/if} 
</div>