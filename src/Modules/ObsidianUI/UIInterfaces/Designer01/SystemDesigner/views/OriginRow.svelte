<script lang="ts">

	import CustomSelect from "../../BaseComponents/CustomSelect/CustomSelect.svelte";
	import './OriginEditor.scss';
	import { GrobDerivedNode, TTRPGSystem, GrobFixedNode, GrobDerivedOrigin} from "../../../../../../../src/Modules/Designer";
	import Trash from '../../BaseComponents/buttons/Trash.svelte'
	import Edit from '../../BaseComponents/buttons/Edit.svelte'
    import { createEventDispatcher, onMount } from "svelte";
	
	export let node :GrobDerivedNode;
	export let system:TTRPGSystem;
	export let inCalc : boolean = false;
	export let symbol : string;
	export let availableSymbols : string [] = [];

	let dispatch = createEventDispatcher();

	export let origin : GrobDerivedOrigin | null = null ;
	onMount(()=>{
		if (origin){
			let segments : string[] = [];
			if (origin.origin){
				segments = origin.origin.getLocationKeySegments();
			}else{
				segments = origin.originKey.split('.');
			}
 
			selectedLevel_0 = segments[0];
			selectedLevel_1 = segments[1];
			selectedLevel_2 = segments[2];

			options_level1 = system.data[selectedLevel_0].getCollectionsNames();
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
				origin = null;
				break;
			case 1:
				//@ts-ignore
				options_level2 = system.getCollection(selectedLevel_0,value)?.getNodeNames();
				selectedLevel_2 = null;
				if (origin){
					dispatch('deselectTargetNode');
				}
				origin = null;
				break;
			case 2:
				//@ts-ignore
				let targetNode = system.getNode(selectedLevel_0,selectedLevel_1,value);
				dispatch('foundTargetNode',targetNode);
				break;
		}
	}

	function onDeselect( level : number){
		if (origin){
			dispatch('deselectTargetNode');
		}
		switch(level){
			case 0: 
				options_level1 = [];
				options_level2 =[];
				origin = null;
				selectedLevel_1 = null;
				selectedLevel_2 = null;
				break;
			case 1:
				//@ts-ignore
				options_level2 = [];
				selectedLevel_2 = null;
				origin = null;
				break;
			case 2:
				//@ts-ignore
				targetNode = null;
				break;
		}
	}

	function ondelete(){
		dispatch('onDelete',symbol)
	}

</script>
<div class="derivedOriginRow" >
	{#if availableSymbols.length == 0}
		<div class="derivedOriginRowInteractionField" >{symbol}</div>
	{:else}
		<CustomSelect selected={symbol} options={ [...availableSymbols, symbol] }	on:onSelect={(e) => console.log(e.detail ?? 'hej')} />
	{/if} 


		<CustomSelect bind:selected={selectedLevel_0} options={ options_level0 }	on:onSelect={(e) => onSelect(0,e.detail)} on:onDeselect={()=>onDeselect(0)} />
	{#key options_level1}
		<CustomSelect bind:selected={selectedLevel_1} options={options_level1}		on:onSelect={(e) => onSelect(1,e.detail)} on:onDeselect={()=>onDeselect(0)} disabled={ options_level1.length == 0 }/>
	{/key}
	{#key options_level2}
		<CustomSelect bind:selected={selectedLevel_2} options={options_level2}		on:onSelect={(e) => onSelect(2,e.detail)} on:onDeselect={()=>onDeselect(0)} disabled={ options_level2.length == 0 }/>
	{/key}
	<div class="derivedOriginRowInteractionField" data-color={ inCalc ? 'verbose' : 'error' } on:click={ondelete} on:keydown={ondelete}>
		<Trash color={'white'}/>
	</div>
</div>