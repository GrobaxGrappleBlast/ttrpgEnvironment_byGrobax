<script  context="module"  lang="ts">
class DragHandlerController {
	
	public data : Writable<SheetData>;
	public constructor( data : Writable<SheetData>){
		this.data = data;
	}

	public isDragging = false;
	public pauseDragg = false;
	public dragID : string;
	public targetID: string;

	public moveRow(){
		
		if (!this.isDragging){
			return;
		}

		if (!this.dragID || !this.targetID || this.targetID  == this.dragID ){
			return;
		}

		this.data.update( list => {

			let a = this.findIndexOfID( this.dragID );
			let b = this.findIndexOfID( this.targetID );

			const temp = list.data[a];
			this.pauseDragg=true;
			setTimeout( () => { this.pauseDragg = false ; }, 100)
			list.data[a] = list.data[b];
			list.data[b] = temp;
 

			return list;
		}) 
		console.log(JSON.stringify(this.data))
	}

	onDragStart( e , id){
		console.log('onDragStart')
		this.isDragging = true;
		this.dragID = id;

		const target = e.target;
		target.setAttribute('data-dragging','true')
	}
	onDragOver( e , id){
		console.log('onDragOver')
		if (!this.isDragging || this.pauseDragg ){
			return;
		}
		this.targetID = id;
		
		
		this.moveRow( );
	}
	onDragEnd( e , id){
		console.log('onDragEnd')
		this.isDragging = false;
		this.dragID = null;
		this.targetID = null;

		const target = e.target;
		target.setAttribute('data-dragging','false')
		console.log(get(this.data));
	}

	findIndexOfID( id ){
		return get(this.data).data.findIndex( p => p.id == id );
	}
 
}
	


</script> 
<script lang="ts">  
	import "./app.scss";
	 
    import { onMount } from "svelte";
    import { CNode, SheetData } from "./Structure/ComponentNode"; 
    import EmptySpot from './Structure/EmptySpot.svelte';
    
    import { get, type Writable, writable } from 'svelte/store';
    import { fly } from "svelte/transition";
	import { flip } from 'svelte/animate';
    
 
	let editMode : boolean = true;
	let _JSON = `{
			"data": [
				{
					"data": []
				},
				{
					"data": [
						null,
						null,
						null,
						null
					]
				},
				{ 
					"data": [
						null,
						null
					]
				}
			]
		}
	`; 
	
	let OBJ : Writable<SheetData> = writable(new SheetData(JSON.parse(_JSON).data));  

	function toogleEditMode() {
		editMode = !editMode; 
	}

	function repeat( x , str , sep = ' '){
		let _ = str;
		for (let i = 0; i < (x-1); i++) {
			_ += sep;
			_ += str;
		}
		return _;
	}
	function addItem(){
		let i = $OBJ.data.length;
		$OBJ.addRow();
		OBJ.update(r=>r);
	}

	function addRowItem( row  ){ 
		
		console.log(JSON.stringify($OBJ));
		console.log('asd');
		$OBJ.data[row].data.push(null)
		OBJ.update( r => r); 

	}

	function allowDrop(ev) {
		ev.preventDefault();
	}
	let DragHandler = new DragHandlerController(OBJ);

</script>
<div class="Sheet">
	<div>
		<button on:click={toogleEditMode}>{ editMode ? 'Stop Edit' : 'Edit'}</button>
	</div>    
	{#each $OBJ.data as row , i (row.id)}
		<div 
			class='Row' 
			data-edit="true"
			style={`grid-template-columns:${repeat(row.data.length, '1fr')}`}  
			data-rowId={row.id}
			on:dragstart={(e)=>DragHandler.onDragStart	(e, row.id)}
			on:dragenter={(e)=>DragHandler.onDragOver	(e, row.id)}
			on:dragend	={(e)=>DragHandler.onDragEnd	(e, row.id)}
			on:dragover	={allowDrop}
			
			transition:fly={{duration:100}}
			animate:flip={{duration:100}}
			draggable="true"
			> 
			<div class="CornerItem" > 
				<button class="addButton"  on:click={() => addRowItem(i)}>+</button>
			</div>
			{#each row.data as item , j (j) }
				<div 
					data-rowId={i}
					data-itemId={j} 
				>
					{#if item == null}
						<EmptySpot 
							editMode={editMode}
						/>
					{/if}
				</div>
			{/each}
		</div>
	{/each} 
	<div>
		<button class="addButton"  on:click={addItem}>+</button>
	</div> 
	
</div>

	
<!--
	<div class="CornerItem" > 
		<button class="addButton"  on:click={() => addRowItem(i)}>+</button>
	</div>
	
-->