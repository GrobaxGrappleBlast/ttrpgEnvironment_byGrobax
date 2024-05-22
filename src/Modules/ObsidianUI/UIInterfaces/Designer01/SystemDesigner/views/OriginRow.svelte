<script lang="ts">

	import CustomSelect from "../../BaseComponents/CustomSelect/CustomSelect.svelte";
	import './OriginEditor.scss';
	import { GrobDerivedNode, TTRPGSystem, GrobFixedNode} from "../../../../../../../src/Modules/Designer";
	import Trash from '../../BaseComponents/buttons/Trash.svelte'
	import Edit from '../../BaseComponents/buttons/Edit.svelte'
	
	export let node :GrobDerivedNode;
	export let system:TTRPGSystem;
	export let deleteAllowed : boolean = false;

	let targetNode : GrobDerivedNode | GrobFixedNode | null = null ;

	let selectedLevel_0 : string | null = null;
	let selectedLevel_1 : string | null = null;
	let selectedLevel_2 : string | null = null;
	
	let options_level0 :string[] = ['fixed','derived'];
	let options_level1 :string[] = [];
	let options_level2 :string[] = [];

	function onSelect( level : number , value : string ){
		debugger
		switch(level){
			case 0:
				if (value == 'fixed') {
					options_level1 = system.fixed.getCollectionsNames()
				} else {
					options_level1 = system.derived.getCollectionsNames()
				} 
				selectedLevel_1 = null;
				selectedLevel_2 = null;
				options_level2 =[];
				targetNode = null;
				break;
			case 1:
				//@ts-ignore
				options_level2 = system.getCollection(selectedLevel_0,value)?.getNodeNames();
				selectedLevel_2 = null;
				targetNode = null;
				break;
			case 2:
				//@ts-ignore
				targetNode = system.getNode(selectedLevel_0,selectedLevel_1,value);
				break;
		}
	}

	function onDeselect( level : number){
		switch(level){
			case 0: 
				options_level1 = [];
				options_level2 =[];
				targetNode = null;
				selectedLevel_1 = null;
				selectedLevel_2 = null;
				break;
			case 1:
				//@ts-ignore
				options_level2 = [];
				selectedLevel_2 = null;
				targetNode = null;
				break;
			case 2:
				//@ts-ignore
				targetNode = null;
				break;
		}

	}

</script>
<div class="derivedOriginRow" >
	<input type="text" maxlength=2 placeholder="@x" />
		<CustomSelect bind:selected={selectedLevel_0} options={ options_level0 }	on:onSelect={(e) => onSelect(0,e.detail)} on:onDeselect={()=>onDeselect(0)} />
	{#key options_level1}
		<CustomSelect bind:selected={selectedLevel_1} options={options_level1}		on:onSelect={(e) => onSelect(1,e.detail)} on:onDeselect={()=>onDeselect(0)} disabled={ options_level1.length == 0 }/>
	{/key}
	{#key options_level2}
		<CustomSelect bind:selected={selectedLevel_2} options={options_level2}		on:onSelect={(e) => onSelect(2,e.detail)} on:onDeselect={()=>onDeselect(0)} disabled={ options_level2.length == 0 }/>
	{/key}
	<div class="derivedOriginRowInteractionField" data-color={ deleteAllowed ? 'verbose' : 'good' }>
		{#if deleteAllowed}
			<Trash color={'white'}/>
		{:else}
			<Edit color={'white'}/>
		{/if}
	</div>
</div>