<script lang="ts">

	import Image_tras from "../buttons/minus.svelte";
	import Image_plus from "../buttons/plus.svelte";
    import Image_edit from "../buttons/edit.svelte"; 
    import { fade, slide } from "svelte/transition";
    import { onMount } from "svelte"; 
    import { writable , type  Writable } from 'svelte/store';

	import './EditAbleList.scss'; 

	export let isEditableContainer:boolean = true;
    export let collection: string[]; 
	export let onSelect: ( d: any ) => boolean;
	export let onAdd:(() => any) | null = null;

	interface IViewElement{
		name:string;
		isSelected:boolean;
		nameEdit:string; 
	}

	let writableCol : Writable< IViewElement[]> = writable([]);
	let selected : IViewElement | null = null;
	onMount(()=>{ 

		init(); 
		let nameOfSelected : string | null = null;
		if($writableCol.length != 0){
			let s = $writableCol.find( p => p.isSelected != false );
			nameOfSelected = s?.name ?? null ;
		}

		let arr :IViewElement[] = [];
		for (let i = 0; i < collection.length; i++) {
			const e = collection[i];
			const item = {
				isSelected : false,
				nameEdit :e,
				name :e
			} as IViewElement;
			arr.push(item);
		}
		
		if(nameOfSelected != null){
			const i = arr.findIndex(p => p.name == nameOfSelected);
			if(i != -1){
				arr[i].isSelected = true;
			}
		}
		
		writableCol.set(arr); 
	})

	function init(){

	}

	export function deselect(){
		if(!selected)
			return;
 
		let i = $writableCol.findIndex( p => p.isSelected ); 
		if( i != -1 )
			$writableCol[i].isSelected = false;
		writableCol.update( r => r ); 

		selected = null;
	}
	 
	function _onSelect(item : IViewElement){ 
	
		let i = $writableCol.findIndex( p => p.isSelected ); 
		if( i != -1 )
			$writableCol[i].isSelected = false;

		i = $writableCol.findIndex( p => p.name == item.name );  
		const isSelected = onSelect($writableCol[i].name); 
		if(isSelected){
			selected = $writableCol[i];
		}else{
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
 
		deselect();
		onAdd();
	}

</script>

<div>
    <div class={ isEditableContainer ? "GrobsInteractiveContainer editableTable" : "editableTable"}>
			{#each $writableCol as element ( element ) }
				<div
					class="Editable_row" 
					data-selected={ element.isSelected }
					transition:slide 
					data-can-hover={true}
				>
					<div
						tabindex="-1"
						class="Editable_column"
						contenteditable="false"
						bind:textContent={element.name} 
						on:click={ () => _onSelect(element) }
						on:keyup={ () => _onSelect(element) }
					> 
						{element.name}
					</div>
				</div>
			{/each}
			{#if onAdd != null }
			<div
				class="Editable_row Editable_rowPlusButton"
				data-selected={ false }
				transition:slide
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
</div>
 