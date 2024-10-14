<script lang="ts">


	import Image_plus from "../buttons/plus.svelte"; 
    import {   slide } from "svelte/transition";
    import { createEventDispatcher, onMount } from "svelte";  
 

	export let isEditableContainer:boolean = true;
    export let collection: string[] | {key:string, value:string, isSelected?:boolean }[]; 
	$: _collection = collection.map( p => { 
		if ( p.key && p.value ){
			return {
				key			:p.key,
				name		:p.value,
				isSelected	:p.isSelected ?? false,
				nameEdit	:p.value,
			}
		}
		else{
			return {
				key			:p as string,
				name		:p as string,
				isSelected	:false,
				nameEdit	:p as string,
			}
		}
	})

	export let onSelect		: ( d: any ) => boolean;
	export let onAdd		: (() => any) | null = null; 
	const dispatch = createEventDispatcher();

	interface IViewElement{
		key:string;
		name:string;
		isSelected:boolean;
		nameEdit:string; 
	}

	let selected : IViewElement | null = null;
	
	export function deselect(){
		if(!selected)
			return;
 
		let i = _collection.findIndex( p => p.isSelected ); 
		if( i != -1 )
			_collection[i].isSelected = false;

		selected = null;
		dispatch('onDeSelect')
	}

	export function select( key : string ){
		let item = _collection.find( p => p.key == key );
		if ( item ){
			_onSelect( item );
		}
	}
	 
	function _onSelect(item : IViewElement){ 

		// get last selected 
		let i = _collection.findIndex( p => p.isSelected ); 
	
		// ensure that a Click on the same item is a deselect
		if ( i != -1 && _collection[i].key == item.key ){
			_collection[i].isSelected = false; 
			selected = null;
			dispatch('onDeSelect')
			return;
		}

		// deselect
		if ( i != -1 )
			_collection[i].isSelected = false;

		i = _collection.findIndex( p => p.key == item.key );  
		const isSelected = onSelect(_collection[i].key); 
		if (isSelected){
			selected = _collection[i];
		} else{
			selected = null;
		}
 
		_collection[i].isSelected = isSelected;
	}

	function _onAdd(){
		if(!onAdd)
			return;	
 
		deselect();
		onAdd();
	}

</script>


    <div class={ isEditableContainer ? "GrobsInteractiveContainer editableTable" : "editableTable"} >
			{#each _collection as e ( e.key ) }
				<button
					class="Editable_row" 
					data-selected={ e.isSelected }
					transition:slide|local
					data-can-hover={true}
				>
					<div
						tabindex="-1"
						class="Editable_column"
						contenteditable="false"
						bind:textContent={e.name} 
						on:click={ () => _onSelect(e) }
						on:keyup
					> 
						{e.name}
					</div>
				</button>
			{/each}
			{#if onAdd != null }
				<div
					class="Editable_row Editable_rowPlusButton"
					data-selected={ false }
					transition:slide|local
					data-can-hover={true}
					style="display:flex;justify-content: center;"
					on:click={ () => _onAdd() }
					on:keyup={ () => _onAdd() }
				>
					<div 
						tabindex="-1"
						class="Editable_Icon"
						contenteditable="false" 
					>  
						<Image_plus color={'#fff'}/>
					</div>
				</div>	
			{/if}
	</div>

 