<script lang="ts">

	import Image_trash from "../buttons/trash.svelte";
	import Image_minus from "../buttons/minus.svelte";
	import Image_plus from "../buttons/plus.svelte";
    import Image_edit from "../buttons/edit.svelte"; 
	import Image_save from "../buttons/download.svelte"; 
    import { slide } from "svelte/transition";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";  
	
	import { tooltip } from '../Messages/toolTip.js'; 
    
    import { StringFunctions } from "../../../../../src/Modules/core/BaseFunctions/stringfunctions";
    import EditAbleList from "./EditAbleList.svelte";
    import EditAbleListRow from "./EditAbleListRow.svelte";
    import { flip } from "svelte/animate";
    import { IViewElementUpdateable } from "../../../../../src/Modules/graphDesigner/UIComposition/Various";


	export let isEditableContainer:boolean = true;
    export let collection: IViewElementUpdateable[] = [];
	export let onSelect		: ( d: IViewElementUpdateable ) => boolean;
	export let onAdd		:(() => any) | null = null; 
	export let onSpecialAdd	:(() => any) | null = null;  
	export let onUpdateItem	:( (item:IViewElementUpdateable[])=>any) | null;
	export let onDeleteItem	:( (item:IViewElementUpdateable)=>any) | null;
	export let disabled : boolean = false;
	const dispatch = createEventDispatcher();

	let selected : IViewElementUpdateable | null = null; 
	let editIsActive = false;  

	onMount(()=>{ 
	 
	})
	
	onDestroy(()=>{
		
	})
 
	export function deselect(){
		if(!selected)
			return;

		selected = null;
		dispatch('onDeSelect')
	}
	export function select( key : string ){
		
		let item = collection.find( p => p.key == key );
		if ( item?.key == selected?.key){
			deselect();
			return;
		}
		
		
		else if ( item ){
			_onSelect( item );
		}
	}
	function _onSelect(item : IViewElementUpdateable){ 

		// ensure that a Click on the same item is a deselect
		if ( item.key == selected?.key ){
			deselect();
			return;
		}
		
		const isSelected = onSelect(item); 
		if (isSelected){
			selected = item;
		} else{
			selected = null;
		}
 
	}
	function _onAdd(){
		if(!onAdd)
			return;	
		onAdd();
	}


	// EDIT FUNCTIONALITIES 
	function onEditClicked( ){

		collection.forEach( item => {
			item.nameEdit = item.name;
		});
		editIsActive = !editIsActive;
	}
	function onEditSaved( ){
	 	  
		if (!onUpdateItem){
			return;
		}
		onUpdateItem( collection );  
		editIsActive = !editIsActive; 
	} 
	function onEditCancelSingle( item : IViewElementUpdateable ){ 
		item.nameEdit = item.name; 
	}
	function onDelete( item : IViewElementUpdateable ){ 
		if ( !onDeleteItem) {
			return;
		}
		onDeleteItem( item );
	} 
	function onEditFocus( row : any ){
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


<div class={ isEditableContainer ? "GrobsInteractiveContainer editableTable" : "editableTable"}>
		{#if (!disabled) }
			<div
				class="Editable_rowHeader"  
				data-can-hover={true} 
			> 
				<!-- edit -->
				{#if onUpdateItem != null }
					{#if !editIsActive }
						<imageContainer 
							on:click={ onEditClicked }
							on:keyup={ onEditClicked }
							transition:slide|local
							role="none"
							use:tooltip={{ text: 'Turn on Edit mode', type:'verbose' }} 
						>
							<Image_edit color={ 'white'} />
						</imageContainer >
					{:else}
						
						<imageContainer 
							on:click={ onEditClicked }
							on:keyup={ onEditClicked }
							transition:slide|local
							role="none"
							use:tooltip={{ text: 'Turn off Edit mode', type:'verbose' }} 
						>
							<Image_edit color={ 'white'} />
						</imageContainer >
						<imageContainer 
							on:click={ onEditSaved }
							on:keyup={ onEditSaved }
							transition:slide|local
							role="none"
							use:tooltip={{ text: 'Save changes made', type:'verbose' }} 
						>
							<Image_save color={ 'white'} />
						</imageContainer >

						<imageContainer 
							on:click={ onEditClicked }
							on:keyup={ onEditClicked }
							transition:slide|local
							role="none"
							use:tooltip={{ text: 'Discard Changes', type:'verbose' }} 
						>
							<Image_minus color={ 'white'} />
						</imageContainer >
					{/if}
				{/if}

				<!-- Add -->
				{#if onAdd != null }
					<imageContainer 
						on:click={ () =>{if(_onAdd){ _onAdd()}} }
						on:keyup 
						transition:slide|local
						role="none"
						use:tooltip={{ text: 'Add To List', type:'verbose' }} 
					>
						<Image_plus color={ 'white'} />
					</imageContainer >
				{/if}

				<!-- Add Special -->
				{#if onSpecialAdd != null }
					<imageContainer 
						on:click={ () => {if(onSpecialAdd){onSpecialAdd()}} }
						on:keyup 
						transition:slide|local
						role="none"
						use:tooltip={{ text: 'Add Entire collection', type:'verbose' }} 
					>
						<Image_plus color={ 'yellow'} />
					</imageContainer >
				{/if}

			</div>
		{/if}
		{#each collection as element , i  ( element.key ) } 
		{@const deleteIsAllowed=( !disabled && (onDeleteItem != null)  )  && !editIsActive  }
				<div
					transition:slide|local
					animate:flip
				>
					<EditAbleListRow
						editIsActive		= {editIsActive}
						bind:element		= {element}
						selected			= {selected}
						disabled			= {disabled}
						deleteIsAllowed		= {deleteIsAllowed}
						onDelete			= {onDelete}
						onSelect			= {_onSelect}
						onEditCancelSingle	= {onEditCancelSingle}
						onEditFocus			= {onEditFocus}
					/> 
				</div>
			<!--
			{@const deleteIsAllowed=( !disabled && (onDeleteItem != null)  )  && !editIsActive  }
			<div
				class="Editable_row" 
				data-selected={ !editIsActive && (element.key == selected?.key) }
				transition:slide|local
				data-can-hover={true}
				data-isEdit={ editIsActive && (element.name != element.nameEdit) } 
			>
				{#if !editIsActive } 
					<div
						tabindex="-1" 
						contenteditable="false" 
						on:click={ () => { if( disabled ){ return }  _onSelect(element)} }
						on:keyup 
						role="none"
					>  
						{ element.name } 
					</div>
				{:else}
					<div
						tabindex="1" 
						role="cell"
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
							on:keyup 
							role="none"
							transition:slide|local
							use:tooltip={{ text: 'Delete item', type:'verbose' , }}
						>
							<Image_trash color={ 'white'}/>
						</imageContainer>   
					{:else if editIsActive && element.name != element.nameEdit }
						<imageContainer  
							on:click={ () => onEditCancelSingle(element) }
							on:keyup 
							role="none"
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
			-->
		{/each}
		
</div>

 