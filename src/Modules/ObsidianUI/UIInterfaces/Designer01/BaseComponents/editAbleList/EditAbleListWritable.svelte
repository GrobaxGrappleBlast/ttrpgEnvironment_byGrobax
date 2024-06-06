<script lang="ts">

	import Image_trash from "../buttons/trash.svelte";
	import Image_minus from "../buttons/minus.svelte";
	import Image_plus from "../buttons/plus.svelte";
    import Image_edit from "../buttons/edit.svelte"; 
	import Image_save from "../buttons/download.svelte"; 
    import { fade, slide } from "svelte/transition";
    import { createEventDispatcher, onMount } from "svelte"; 
    import { writable , type  Writable } from 'svelte/store';

	import './EditAbleList.scss'; 

	export let isEditableContainer:boolean = true;
    export let collection: Writable<string[] | {key?:string, value:string, isSelected?:boolean }[]>; 
	export let onSelect: ( d: any ) => boolean;
	export let onAdd:(() => any) | null = null; 
	export let onSpecialAdd:(() => any) | null = null;  
	export let onUpdateItem:( (oldName:string, newName:string)=>any) | null;
	export let onDeleteItem:( (name:string)=>any) | null;
	export let disabled : boolean = false;
	const dispatch = createEventDispatcher();

	interface IViewElement{
		key:string;
		name:string;
		isSelected:boolean; 
		nameEdit:string;
		isEdit:boolean; 
	}

	let writableCol : Writable< IViewElement[]> = writable([]);
	let selected : IViewElement | null = null; 
	
	onMount(()=>{ 
		Mount();
	})
	
	collection.subscribe( p => { Mount() });

	function Mount(){ 
		let arr :IViewElement[] = [];
		for (let i = 0; i < $collection.length; i++) {
			const e = $collection[i];
			let item : IViewElement;
			if(typeof e == "string"){
				item = {
					key:e,
					isSelected : false, 
					nameEdit :e,
					name :e,
					isEdit : false
				} as IViewElement;
				arr.push(item);
			}else{
				item = {
					key:e.key ?? e.value,
					isSelected : e.isSelected != undefined ? e.isSelected : false, 
					nameEdit :e.value,
					name :e.value,
					isEdit : false
				} as IViewElement;
				arr.push(item);
			} 
		} 
		writableCol.set(arr); 
	}
 
	export function deselect(){
		if(!selected)
			return;
 
		let i = $writableCol.findIndex( p => p.isSelected ); 
		if( i != -1 )
			$writableCol[i].isSelected = false;
		writableCol.update( r => r ); 

		selected = null;
		dispatch('onDeSelect')
	}

	export function select( key : string ){
		let item = $writableCol.find( p => p.key == key );
		if ( item ){
			_onSelect( item );
		}
	}
	 
	function _onSelect(item : IViewElement){ 

		// get last selected 
		let i = $writableCol.findIndex( p => p.isSelected ); 
	
		// ensure that a Click on the same item is a deselect
		if ( i != -1 && $writableCol[i].key == item.key ){
			$writableCol[i].isSelected = false;
			writableCol.update( r => r ); 
			selected = null;
			dispatch('onDeSelect')
			return;
		}

		// deselect
		if ( i != -1 )
			$writableCol[i].isSelected = false;

		i = $writableCol.findIndex( p => p.key == item.key );  
		const isSelected = onSelect($writableCol[i].key); 
		if (isSelected){
			selected = $writableCol[i];
		} else{
			selected = null;
		}
 
		writableCol.update( r => {
			r[i].isSelected = isSelected;  
			return r;
		} ); 
	}

	function _onAdd(){
		if(!onAdd)
			return;	

		//deselect();
		onAdd();
	}


	// EDIT FUNCTIONALITIES 
	function onEditClicked( element : IViewElement ){
	 	  
		if (!onUpdateItem){
			return;
		}

		element.isEdit = !element.isEdit;

		// if its time to save, save. 
		if ( !element.isEdit ){
			onUpdateItem( element.key , element.nameEdit );
		}  
		writableCol.update(r => r)
	 }
	function onEditCancel( element ){
		console.log("onEditCancel");
		element.isEdit = !element.isEdit;
		writableCol.update(r => r)
	}


</script>


    <div class={ isEditableContainer ? "GrobsInteractiveContainer editableTable" : "editableTable"} >
			{#each $writableCol as element ( element.key ) }
				<div
					class="Editable_row" 
					data-selected={ element.isSelected }
					transition:slide 
					data-can-hover={true}
					data-isEdit={ element.isEdit }
				>
					{#if !element.isEdit } 
						<div
							tabindex="-1"
							class="Editable_column"
							contenteditable="false"
							 
							on:click={ () => { if( disabled ){ return }  _onSelect(element)} }
							on:keyup={ () => { if( disabled ){ return }  _onSelect(element)} }
						>  
							{ element.name } 
						</div>
					{:else}
						<div
							tabindex="-1"
							class="Editable_column"
							contenteditable="true"
							bind:textContent={ element.nameEdit } 
							on:click={ () => { if( disabled ){ return }  _onSelect(element)} }
							on:keyup={ () => { if( disabled ){ return }  _onSelect(element)} }
						>   
						</div>
					{/if }
				 
					{#if !disabled && ((onUpdateItem != null) || (onDeleteItem != null) ) }  
						{#if (onUpdateItem != null) } 
							<div  transition:slide|local
								on:click={ () => onEditClicked(element) }
								on:keyup={ () => onEditClicked(element) }
							> 	
								{#if element.isEdit }
									<Image_save color={ 'white'}/>
								{:else}
									<Image_edit color={ 'white'}/>
								{/if}
							</div>  
							{#if element.isEdit } 
								<div  transition:slide|local
									on:click={ () => onEditCancel(element) }
									on:keyup={ () => onEditCancel(element) }
								>
									<Image_minus color={'white'}/>
								</div> 
							{/if} 
						{/if } 
						{#if (onDeleteItem != null) && !element.isEdit }
							<div  transition:slide|local >
								<Image_trash color={'white'}/>
							</div>
						{/if} 
					{/if} 
				</div>
			{/each}
			{#if (onSpecialAdd != null || onAdd != null ) && !disabled } 
				<div
					class="Editable_row Editable_rowPlusButton"
					data-selected={ false }
					transition:slide
					data-can-hover={true}
					style="display:flex;justify-content: center;" 
				>
					{#if onSpecialAdd != null}
						<div 
							tabindex="-1"
							class="Editable_Icon"
							contenteditable="false" 
							on:click={ () => onSpecialAdd() }
							on:keyup={ () => onSpecialAdd() }
						>  
							<Image_plus color={'yellow'}/>
						</div>
					{/if}
					{#if onAdd != null }
						<div 
							tabindex="-1"
							class="Editable_Icon"
							contenteditable="false" 
							on:click={ () => _onAdd() }
							on:keyup={ () => _onAdd() }
						>  
							<Image_plus color={'#fff'}/>
						</div> 
					{/if}
				</div> 
			{/if}
	</div>

 