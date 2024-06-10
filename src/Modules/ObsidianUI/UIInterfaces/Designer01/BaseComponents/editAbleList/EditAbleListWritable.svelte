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
	import { tooltip } from '../Messages/toolTip.js';

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
	}
 
	let writableCol : Writable< IViewElement[]> = writable([]);
	let selected : IViewElement | null = null; 
	let editIsActive = false; 
	
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
					name :e
				} as IViewElement;
				arr.push(item);
			}else{
				item = {
					key:e.key ?? e.value,
					isSelected : e.isSelected != undefined ? e.isSelected : false, 
					nameEdit :e.value,
					name :e.value
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
	function onEditClicked( ){
		editIsActive = !editIsActive;
	}
	function onEditSaved( ){
	 	  
		if (!onUpdateItem){
			return;
		}

		for (let i = 0; i < $writableCol.length; i++) {
			const e = $writableCol[i];
			onUpdateItem( e.key , e.nameEdit );
		}
  
		writableCol.update(r => r)
	} 
	function onEditCancel(  ){ 

		for (let i = 0; i < $writableCol.length; i++) {
			const e = $writableCol[i];
			e.nameEdit = e.name;
		}
		
		writableCol.update(r => r)
	}
	function onEditCancelSingle(  e ){ 
		e.nameEdit = e.name;
		writableCol.update(r => r)
	}
	function onDelete( element ){ 
		if ( !onDeleteItem) {
			return;
		}

		writableCol.update(r => {
			return r.filter( p => p.key != element.key)
		});
		onDeleteItem(element.name);
	} 
	function onEditFocus( row ){
		const element = row.target;
		const range = document.createRange();
		const selection = window.getSelection();
  
		if (!range || !selection){
			return;
		}
 
		range.selectNodeContents(element);
		range.collapse(false); // Collapse the range to the end
		selection.removeAllRanges();
		selection.addRange(range);
	}

 

</script>


    <div class={ isEditableContainer ? "GrobsInteractiveContainer editableTable" : "editableTable"} >
			{#if (!disabled) }
				<div
					class="Editable_rowHeader"  
					transition:slide|local
					data-can-hover={true} 
				>

					<!-- edit -->
					{#if onUpdateItem != null }
						{#if !editIsActive }
							<imageContainer 
								on:click={ onEditClicked }
								on:keyup={ onEditClicked }
								transition:slide|local
								use:tooltip={{ text: 'Turn on Edit mode', type:'verbose' }} 
							>
								<Image_edit color={ 'white'} />
							</imageContainer >
						{:else}
							
							<imageContainer 
								on:click={ onEditClicked }
								on:keyup={ onEditClicked }
								transition:slide|local
								use:tooltip={{ text: 'Turn off Edit mode', type:'verbose' }} 
							>
								<Image_edit color={ 'white'} />
							</imageContainer >
							<imageContainer 
								on:click={ onEditSaved }
								on:keyup={ onEditSaved }
								transition:slide|local
								use:tooltip={{ text: 'Save changes made', type:'verbose' }} 
							>
								<Image_save color={ 'white'} />
							</imageContainer >

							<imageContainer 
								on:click={ onEditCancel }
								on:keyup={ onEditCancel }
								transition:slide|local
								use:tooltip={{ text: 'Discard Changes', type:'verbose' }} 
							>
								<Image_minus color={ 'white'} />
							</imageContainer >
						{/if}
					{/if}

					<!-- Add -->
					{#if onAdd != null }
						<imageContainer 
							on:click={ () => _onAdd() }
							on:keyup={ () => _onAdd() }
							transition:slide|local
							use:tooltip={{ text: 'Add To List', type:'verbose' }} 
						>
							<Image_plus color={ 'white'} />
						</imageContainer >
					{/if}

					<!-- Add Special -->
					{#if onSpecialAdd != null }
						<imageContainer 
							on:click={ () => onSpecialAdd() }
							on:keyup={ () => onSpecialAdd() }
							transition:slide|local
							use:tooltip={{ text: 'Add Entire collection', type:'verbose' }} 
						>
							<Image_plus color={ 'yellow'} />
						</imageContainer >
					{/if}

				</div>
			{/if}
			{#each $writableCol as element , i  ( element.key ) } 
				{@const deleteIsAllowed=( !disabled && (onDeleteItem != null)  )  && !editIsActive  }
				<div
					class="Editable_row" 
					data-selected={ !editIsActive && element.isSelected }
					transition:slide|local
					data-can-hover={true}
					data-isEdit={ editIsActive && (element.name != element.nameEdit) } 
				>
					{#if !editIsActive } 
						<div
							tabindex="-1" 
							contenteditable="false" 
							on:click={ () => { if( disabled ){ return }  _onSelect(element)} }
							on:keyup={ () => { if( disabled ){ return }  _onSelect(element)} }
						>  
							{ element.name } 
						</div>
					{:else}
						<div
							tabindex="1" 
							contenteditable="true"
							on:focus={ onEditFocus }
							bind:textContent={ element.nameEdit } 
							autofocus={true}
						> 
						</div>
					{/if }
				  
					<div> 
						{#if deleteIsAllowed } 
							<imageContainer  
								on:click={ () => onDelete( element ) }
								on:keyup={ () => onDelete( element ) }
								transition:slide|local
								use:tooltip={{ text: 'Delete item', type:'verbose' , }}
							>
								<Image_trash color={ 'white'}/>
							</imageContainer>   
						{:else if editIsActive && element.name != element.nameEdit }
							<imageContainer  
								on:click={ () => onEditCancelSingle(element) }
								on:keyup={ () => onEditCancelSingle(element) }
								transition:slide|local
								use:tooltip={{ text: 'Delete item', type:'verbose' , }}
							>
								<Image_minus color={ 'white'}/>
							</imageContainer>   
						{:else}
							<imageContainer > </imageContainer> 
						{/if}
						
					</div> 
				</div>
			{/each}
			
	</div>

 