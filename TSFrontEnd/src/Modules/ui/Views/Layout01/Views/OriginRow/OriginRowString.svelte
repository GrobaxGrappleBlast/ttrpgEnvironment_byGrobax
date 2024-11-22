<script lang="ts">
   
    import { createEventDispatcher, onMount } from "svelte";  
    import { slide } from "svelte/transition";
    import CustomSelect						from '../../../../Components/CustomSelect/CustomSelect.svelte';
    import Trash							from '../../../../Components/buttons/trash.svelte';
	import { TTRPGSystemJSONFormatting }	from '../../../../../graphDesigner';	
    import { Layout01Context } from "../../context";
    import { GrobNodeType } from "ttrpg-system-graph";


	type stringOrNull = string|null;
	let dispatch = createEventDispatcher();
	export let system:TTRPGSystemJSONFormatting; 
	export let rowData : string;
	export let context	: Layout01Context; 

	let rowSegments : stringOrNull[] = [];
	var seg0 : stringOrNull= null;
	var seg1 : stringOrNull= null;
	var seg2 : stringOrNull= null;

	let target : GrobNodeType | null = null; 
	
	let options_level0 :string[] = ['fixed','derived'];
	let options_level1 :string[] = [];
	let options_level2 :string[] = [];

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
		while( _rowSegments.length < 3 ){
			_rowSegments.push(null)
		}

		// row segments. 
		seg0 = _rowSegments[0];
		seg1 = _rowSegments[1];
		seg2 = _rowSegments[2];
		
		// create teporary value savers 
		let _seg0 = seg0;
		let _seg1 = seg1;
		let _seg2 = seg2;

		// create an end function 
		function end( res : stringOrNull[] ){
			rowData = (res[0] ?? 'unknown') +'.'+ (res[1] ?? 'unknown') +'.' + (res[2] ?? 'unknown');
			seg0 = res[0];
			seg1 = res[1];
			seg2 = res[2]; 
		}

		// try to select eacb seg.
		if( _seg0 && !onSelect( 0 , _seg0 ) ){
			let res = [null, null, null];
			end(res);
			return res;
		}

		if (_seg1 && !onSelect(1, _seg1)){
			let res = [_seg0, null, null]; 
			end(res);
			return res;
		}

		if (_seg2 && !onSelect(2, _seg2)){
			let res = [_seg0, _seg1, null];
			end(res);
			return res;
		}

		let res = [_seg0, _seg1, _seg2];
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
				rowSegments[2] = null;
				options_level2 =[];
				target = null; 
				if (origin){
					dispatch('deselectTargetNode');
				}
				break;
			case 1:
				//@ts-ignore
				options_level2 = system.getCollection(seg0 ?? '', value )?.getNodeNames();
				success = system.getCollection(seg0 ?? '', value ) ? true : false;
				rowSegments[1] = value;
				rowSegments[2] = null;
				target = null; 
				if (origin){
					dispatch('deselectTargetNode');
				}
				break;
			case 2:

				//@ts-ignore
				let targetNode = system.getNode(seg0 ?? '',seg1 ?? '', value );
				success = system.getNode(seg0 ?? '',seg1 ?? '', value ) ? true : false;
				rowSegments[2] = value;
				target = targetNode;
				dispatch('foundTargetNode',targetNode); 
				break;
		}
		seg0 = rowSegments[0];
		seg1 = rowSegments[1];
		seg2 = rowSegments[2]; 
		rowData = (rowSegments[0] ?? 'unknown') +'.'+ (rowSegments[1] ?? 'unknown') +'.' + (rowSegments[2] ?? 'unknown');
		return success;
	}

	function onDeselect( level : number){
		if (origin){
			dispatch('deselectTargetNode');
		}
		switch (level){
			case 0: 
				options_level1 = [];
				options_level2 =[];
				target = null;
				rowSegments[1] = null;
				rowSegments[2] = null;
				break;
			case 1:
				//@ts-ignore
				options_level2 = [];
				rowSegments[2] = null;
				target = null;
				break;
			case 2:
				//@ts-ignore
				targetNode = null;
				break;
		}
	}

	function ondelete(){
		dispatch('onDelete',rowData)
	}

</script>


<div class="derivedStringOriginRow" data-styleActive="true"	transition:slide|local  >

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
		
		on:onSelect={(e) => onSelect(0,e.detail)} 
		on:onDeselect={()=>onDeselect(0)} 
		/>
	<CustomSelect 
		bind:selected={seg1}
		options={options_level1}	
		disabled={!(options_level0)}	
		context={context}
		
		on:onSelect={(e) => onSelect(1,e.detail)} 
		on:onDeselect={()=>onDeselect(0)} 
	/>
	<CustomSelect 
		bind:selected={seg2}
		options={options_level2}	
		disabled={!(options_level1)}	
		context={context}
			
		on:onSelect={(e) => onSelect(2,e.detail)}
		on:onDeselect={()=>onDeselect(0)}
	
	/>

	<!-- Deletes -->
	<imagecontainer class="derivedOriginRowInteractionField" role="none" on:click={ondelete} on:keydown={ondelete}>
		<Trash color={'white'}/>
	</imagecontainer>
</div> 
