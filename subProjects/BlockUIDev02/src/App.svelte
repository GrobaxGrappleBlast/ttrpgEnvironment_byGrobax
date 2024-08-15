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
		}

		onDragStart( e , id){  

			const target = e.target;
			if (!target.classList.contains('Row')){
				return;
			}

			this.isDragging = true;
			this.dragID = id; 
			target.setAttribute('data-dragging','true') 
		}
		onDragOver( e , id){  
			if (!this.isDragging || this.pauseDragg ){
				return;
			}
			this.targetID = id;
			this.moveRow( ); 
		}
		onDragEnd( e , id){  
			this.isDragging = false;
			this.dragID = null;
			this.targetID = null;
			const target = e.target;
			target.setAttribute('data-dragging','false') 
		}

		findIndexOfID( id ){
			return get(this.data).data.findIndex( p => p.id == id );
		} 
	} 

	class DragItemHandlerController {
		
		public data : Writable<SheetData>;
		public constructor( data : Writable<SheetData>){
			this.data = data;
		}

		public isDragging = false;
		public pauseDragg = false;
		public dragID : string;
		public targetID: string;

		public moveRowItem(){
			
			if (!this.isDragging){
				return;
			}
			
			if (!this.dragID || this.targetID  == this.dragID ){
				return;
			}
		
			this.data.update( list => {

				let row_a; let a;
				let row_b; let b;
				[row_a, a] = this.findRowIndexOfID(this.dragID);
				[row_b, b] = this.findRowIndexOfID(this.targetID); 

				if(row_a == -1 || row_b == -1 ){
					return list;
				}

				this.pauseDragg=true;
				setTimeout( () => { this.pauseDragg = false ; }, 100)

				const oa = list.data[row_a].data[a];
				const ob = list.data[row_b].data[b];
				list.data[row_a].data[a] = ob;
				list.data[row_b].data[b] = oa;

				return list;
			})  
		}

		onDragStart( e , id){  
			const target = e.target;
			if (!target.classList.contains('itemSlot')){
				return;
			}

			this.isDragging = true; 
			this.dragID = id; 
			target.setAttribute('data-dragging','true') 
		}
		onDragOver( e , id){  
			if (!this.isDragging || this.pauseDragg ){
				return;
			}
			this.targetID = id; 
			this.moveRowItem( ); 
		}
		onDragEnd( e, id){  
			this.isDragging = false;
			this.dragID			= null;
			this.targetID		= null;
			const target = e.target;
			target.setAttribute('data-dragging','false') 
		}

		findRowIndexOfID( id ){

			let itemId = -1; 
			let rowId = get(this.data).data.findIndex( 
				(p) => {
					let i = p.data.findIndex(j => j.id == id) ; 
					if (i != -1){
						itemId = i;
						return true;
					}
					return false;
				} 
			);
			return [rowId, itemId];
		} 
		
		isBeingDragged( id ){
			return this.dragID == id ;
		}
	} 

	class DragItemHandlerController2 {
		
		public data : Writable<SheetData>;
		public constructor( data : Writable<SheetData>){
			this.data = data;
		}

		public isDragging = false;
		public pauseDragg = false;
		public dragTargetElement:HTMLElement;

		public dragID : string;
		public targetID: string;

		public lastDragId : string;
		public lasttargId : string;

		public innerMoveItem( list , fromId , toID ){

				let row_a; let a;
				let row_b; let b;
				[row_a, a] = this.findRowIndexOfID(fromId);
				[row_b, b] = this.findRowIndexOfID(toID); 

				if(row_a == -1 || row_b == -1 ){
					return;
				}
				const oa = list.data[row_a].data[a];
				const ob = list.data[row_b].data[b];
				list.data[row_a].data[a] = ob;
				list.data[row_b].data[b] = oa;
		}
		public moveRowItem(){
			
			if (!this.isDragging){
				return;
			}
			
			if (!this.dragID || this.targetID == this.dragID ){
				return;
			}
		
			this.data.update( list => {

				// in case we try to place it back into the original space
				if ( this.dragID == this.lastDragId && this.targetID == this.lasttargId ){
					this.innerMoveItem( list , this.lasttargId, this.lastDragId	 );
					return list;
				}

				// move last items back
				if (this.lastDragId	&& this.lasttargId){
					this.innerMoveItem( list , this.lastDragId	, this.lasttargId );
				}
				// move next item set forward
				if ( this.targetID ){
					this.innerMoveItem( list , this.dragID		, this.targetID );
				}
				 
				this.lastDragId=this.dragID;
				this.lasttargId=this.targetID;
				this.pauseDragg=true;
				setTimeout( () => { this.pauseDragg = false ; }, 100)
				return list;
			})  
		}
		

		onDragStart( e , id){  
			const target = e.target;
			if (!target.classList.contains('itemSlot')){
				return;
			}
			this.dragTargetElement = target;
			this.isDragging = true; 
			this.dragID = id; 
			this.lastDragId = null;
			this.lasttargId = null; 
			target.setAttribute('data-dragging','true') 
			
		}
		onDragOver( e , id){  
			if (!this.isDragging || this.pauseDragg ){
				return;
			}
			this.targetID = id; 
			this.moveRowItem( ); 
			this.dragTargetElement	?.setAttribute('data-dragging','true')  
		}
		onDragEnd( e, id){    
			this.isDragging = false; 
			this.dragID			= null;
			this.targetID		= null; 
			
			e.target				.setAttribute('data-dragging','false') 
			this.dragTargetElement	?.setAttribute('data-dragging','false')  
		}
		onLeave( e,id){
			this.targetID		= null;
			
		}
		
		findRowIndexOfID( id ){

			let itemId = -1; 
			let rowId = get(this.data).data.findIndex( 
				(p) => {
					let i = p.data.findIndex(j => j.id == id) ; 
					if (i != -1){
						itemId = i;
						return true;
					}
					return false;
				} 
			);
			return [rowId, itemId];
		} 
		
		isBeingDragged( id ){
			return this.dragID == id ;
		}
	} 
</script> 
<script lang="ts">  
	import "./app.scss";
	 
    import { onMount } from "svelte";
    import { CNode, SheetData, keyManager } from "./Structure/ComponentNode";  
    
    import { get, type Writable, writable } from 'svelte/store';
    import { fade, fly } from "svelte/transition";
	import { flip } from 'svelte/animate'; 
    import ItemDestributor from "./Structure/ItemDestributor.svelte";
    import { system } from "./devDependency/declaration";
	
 
	let editMode : boolean = true;
	let _JSON = `{
			"data": [
				{
					"data": []
				},
				{
					"data": [
						{
							"type":"HitPoints",
							"data":"{}"
						},
						{
							"type":"ProficiencyBonus",
							"data":"{}"	
						},
						{
							"type":"SkillProficiencies",
							"data":"{}"
						},
						{
							"type":"SpellInfo",
							"data":"{}"
						}
					]
				},
				{ 
					"data": [
						{
							"type":"Stats",
							"data":"{}"
						},
						{}
					]
				}
			]
		}
	`; 
	
	let sys = new system();
	let OBJ : Writable<SheetData> = writable(new SheetData(JSON.parse(_JSON).data));  
	function testSetUp(){
		sys.fixed.stats.charisma	.setValue(10 )	;
		sys.fixed.stats.constitution.setValue(10 +2);
		sys.fixed.stats.dexterity	.setValue(10 +4);
		sys.fixed.stats.intelligence.setValue(10 +6)	;
		sys.fixed.stats.strength	.setValue(10 +2);
		sys.fixed.stats.wisdom		.setValue(10 +4);

		let _ = Object.keys(sys.fixed.SkillProficiencies);
		for (let i = 0; i < _.length; i++) {
			const key = _[i];
			const prof = Math.floor(Math.random() * 3);
			sys.fixed.SkillProficiencies[key].setValue(prof);
		}

		sys.fixed.generic["Proficiency Bonus"].setValue(2);
		sys.fixed.generic["Hit Points"].setValue(50);
	}
	onMount(()=>{
		testSetUp();  
	})

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
		$OBJ.addRow();
		OBJ.update(r=>r);
	}
	function addRowItem( row  ){ 
		$OBJ.data[row].addItem();
		OBJ.update( r => r); 
	}
	function allowDrop(ev) {
		ev.preventDefault();
	}
	let DragHandler = new DragHandlerController(OBJ);
	let DragItemHandler = new DragItemHandlerController2(OBJ);
</script>
<div class="Sheet">
	<div>
		<button on:click={toogleEditMode}>{ editMode ? 'Stop Edit' : 'Edit'}</button>
	</div>    
	{#each $OBJ.data as row , i (row.id)}
		<div 
			class='Row' 
			data-edit={editMode}
			style={`grid-template-columns:${repeat(row.data.length, '1fr')}`}  
			data-rowId={row.id}
			on:dragstart={(e)=>DragHandler.onDragStart	(e, row.id)}
			on:dragenter={(e)=>DragHandler.onDragOver	(e, row.id)}
			on:dragend	={(e)=>DragHandler.onDragEnd	(e, row.id)}
			on:dragover	={allowDrop}
			
			transition:fly={{duration:100, y:100}}
			animate:flip={{duration:100}}
			draggable="true"
			> 
			<div class="CornerItem" > 
				<button class="addButton"  on:click={() => addRowItem(i)}>+</button>
			</div>
			{#each row.data as item , j (item.id) }
				<div 
					class='itemSlot' 
					data-edit={editMode} 
					data-rowId={row.id}
					data-itemId={item.id} 
					data-dragging={DragItemHandler.isBeingDragged(item.id)}
					transition:fade={{duration:100}}
					animate:flip={{ duration:100  }} 
					on:dragstart={(e)=>{DragItemHandler.onDragStart	(e,item.id)}}
					on:dragenter={(e)=>{DragItemHandler.onDragOver	(e,item.id)}}
					on:dragend	={(e)=>{DragItemHandler.onDragEnd	(e,item.id)}}
					on:drop		={(e)=>{DragItemHandler.onDragEnd	(e,item.id)}}  
					on:dragleave={(e)=>{DragItemHandler.onLeave		(e,item.id)}}   
					
					on:dragover	={allowDrop}
					draggable="true"
				>
					{#if item.type != 'NONE'}
						<ItemDestributor 
							data={item}
							editMode={editMode}
							sys={sys}
						/>
						
					{:else if editMode}
						<div style="width:50px;height:50px;">
							{item.type}
						</div>
					{:else}
						<div >

						</div>
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