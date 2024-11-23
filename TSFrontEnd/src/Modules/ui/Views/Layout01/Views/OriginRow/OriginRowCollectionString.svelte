<script lang="ts">
   
    import { createEventDispatcher, onMount } from "svelte";  
    import { slide } from "svelte/transition";
    import CustomSelect						from '../../../../Components/CustomSelect/CustomSelect.svelte';
    import Trash							from '../../../../Components/buttons/trash.svelte';
	import { TTRPGSystemJSONFormatting }	from '../../../../../graphDesigner';	
    import { Layout01Context } from "../../context";
    import { GrobCollection, GrobNodeType } from "ttrpg-system-graph";


	type stringOrNull = string|null;
	let dispatch = createEventDispatcher();
	export let system:TTRPGSystemJSONFormatting; 
	export let rowData : string;
	export let context	: Layout01Context; 
	export let nonSelectedString = '-'

	let rowSegments : stringOrNull[] = [];
	var seg0 : stringOrNull= null;
	var seg1 : stringOrNull= null;

	export let target : GrobCollection<GrobNodeType> | null = null; 
	
	let options_level0 :string[] = ['fixed','derived'];
	let options_level1 :string[] = [];

	onMount( () => { rowSegments = Mount(); } )

	function Mount (){
 
		// ensure string or null
		var _rowSegments = rowData.split('.').map( p => {
			if(p == 'unknown'){
				return null;
			}
			return p;
		})

		// ensure length is 3. 
		while( _rowSegments.length < 2 ){
			_rowSegments.push(null)
		}

		// row segments. 
		seg0 = _rowSegments[0];
		seg1 = _rowSegments[1]; 
		
		// create teporary value savers 
		let _seg0 = seg0;
		let _seg1 = seg1; 

		// create an end function 
		function end( res : stringOrNull[] ){
			rowData = (res[0] ?? 'unknown') +'.'+ (res[1] ?? 'unknown');
			seg0 = res[0];
			seg1 = res[1]; 
		}

		// try to select eacb seg.
		if( _seg0 && !onSelect( 0 , _seg0 ) ){
			let res = [null, null];
			end(res);
			return res;
		}

		if (_seg1 && !onSelect(1, _seg1)){
			let res = [_seg0, null ]; 
			end(res);
			return res;
		}
 
		let res = [_seg0, _seg1];
		end(res);
		return res;
	}

	function onSelect( level : number , value : string ){

		var success = false;
		switch(level){
			case 0:

				options_level1 = system.getGroup(value)?.getCollectionsNames();
				success = system.getGroup(value) ? true : false;
				rowSegments[0] = value;
				rowSegments[1] = null;
				target = null; 
				if (origin){
					dispatch('deselectTargetNode');
				}
				break;
			case 1:
				//@ts-ignore
				//options_level2 = system.getCollection(seg0 ?? '', value )?.getNodeNames();
				target = system.getCollection(seg0 ?? '', value );
				success = target ? true : false;
				rowSegments[1] = value; 
			 
				if (!success){
					dispatch('deselectTargetNode');
				}
				else {
					dispatch('foundTargetNode',target); 
				}
				break;
		}
		seg0 = rowSegments[0];
		seg1 = rowSegments[1]; 
		rowData = (rowSegments[0] ?? 'unknown') +'.'+ (rowSegments[1] ?? 'unknown');
		return success;
	}

	function onDeselect( level : number){
		if (origin){
			dispatch('deselectTargetNode');
		}
		switch (level){
			case 0: 
				options_level1 = [];
				target = null;
				rowSegments[1] = null;
				break;
			case 1:
				//@ts-ignore
				target = null;
				break; 
		}
	}

	function ondelete(){
		dispatch('onDelete',rowData)
	}

</script>


<div class="OriginRowCollectionString _derivedOriginRow" data-styleActive="true"	transition:slide|local  >

	<div class="symbol" >
		{#if target != null }
			<span>&#10003;</span>
		{:else}
			<span>&#10540;</span>
		{/if}
	</div>
	<!-- Selects -->
	<CustomSelect 
		bind:selected={seg0}
		options={ options_level0 }	
		context={context}	
		unSelectedplaceholder={nonSelectedString}
		on:onSelect={(e) => onSelect(0,e.detail)} 
		on:onDeselect={()=>onDeselect(0)} 
	/>
	<CustomSelect 
		bind:selected={seg1}
		options={options_level1}	
		disabled={!(options_level0)}	
		context={context}
		unSelectedplaceholder={nonSelectedString}
		on:onSelect={(e) => onSelect(1,e.detail)} 
		on:onDeselect={()=>onDeselect(0)} 
	/>
	<!-- Deletes -->
	<imagecontainer class="derivedOriginRowInteractionField" role="none" on:click={ondelete} on:keydown={ondelete}>
		<Trash color={'white'}/>
	</imagecontainer>
</div> 
