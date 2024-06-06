<script lang="ts">
    import { SystemPreview } from "../../../../../../src/Modules/ObsidianUICore/model/systemPreview";
    import ToogleSection from "../BaseComponents/ToogleSection/ToogleSection.svelte";
	import EditableList from "../BaseComponents/editAbleList/EditAbleList.svelte";
    import { onMount } from "svelte";
    import { writable, type Writable } from "svelte/store";
	import {ObsidianUICoreAPI} from '../../../../../../src/Modules/ObsidianUICore/API'
    import { GrobCollection, GrobDerivedNode, GrobDerivedOrigin, GrobFixedNode, TTRPGSystem } from "../../../../../../src/Modules/Designer";
    import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import "./SystemDesigner.scss";
    import EditAbleListWritable from "../BaseComponents/editAbleList/EditAbleListWritable.svelte";
    import type { IOutputHandler } from "src/Modules/Designer/Abstractions/IOutputHandler";
    import FixedItemDesigner from "./FixedItemDesigner.svelte";
	import DerivedItemDesigner from "./DerivedItemDesigner.svelte";
	import DerivedCollectionDesigner from "./DerivedCollectionDesigner.svelte";
    import { slide } from "svelte/transition";

	export let systemPreview : Writable<SystemPreview>;
	let loaded : boolean = false;
	let messageHandler : StaticMessageHandler;
	let designer : Writable<TTRPGSystem|null>  = writable(null);


	// ensure that the system is reloaded if the preview is reloaded. 
	onMount(()=>{ loadNewSystemDesign();})
	systemPreview.subscribe( (r) => { loadNewSystemDesign() })
	async function loadNewSystemDesign(){
		
		if(!systemPreview){
			messageHandler?.removeAllMessages();
			messageHandler?.addMessageManual('loadingtrouble','Something went wrong, and defined preview was null','error');
			return;
		}
		
		loaded = false;
		let api = ObsidianUICoreAPI.getInstance();
		let response = await api.systemFactory.getOrCreateSystemFactory( $systemPreview );
		if ( response.responseCode >= 200 && response.responseCode < 300 ){
			designer.set(response.response as TTRPGSystem);
		}

		messageHandler?.removeAllMessages();
		for(const key in response.messages){
			messageHandler?.addMessage(key,response.messages[key]);
		}
	}


	type viewE = {
		key:string;
		value:string;
		isSelected:boolean; 
	}
	function nameToIViewItem( name:string , isSelected:boolean ){
		return {
			key:name,
			value:name,
			isSelected:isSelected
		}
	}

	// a value to track wether or not a change has been made to the system.
	// this could be replaced with an elaborate trackker or item hasher, but we use a simple has changed bool
	let anyChanges  = false;
	let valid 		= true;
	let savingMessageHandler: StaticMessageHandler; 

	// views 
	let toogleFixedSection	: ToogleSection;
	let listViewFixed_1		: EditAbleListWritable; 
	let listViewFixed_2		: EditAbleListWritable; 

	let toogleDerivedSection: ToogleSection;
	let listViewDerived_1	: EditAbleListWritable;
	let listViewDerived_2	: EditAbleListWritable;

	// fixed data
	let fixedCollection 				: Writable<viewE[]>	= writable([]);
	let selectedFixedCollectionName		: string | null 			= null
	let selectedFixedCollectionData		: Writable<viewE[]>	= writable([]);
	let selectedFixedNodeName			: string | null 			= null
	let selectedFixedNode				: Writable<GrobFixedNode | null> = writable(null);

	// derived data
	let derivedCollection				: Writable<viewE[]>	= writable([]);
	let selectedDerivedCollectionName	: string | null 			= null
	let selectedDerivedCollectionData	: Writable<viewE[]> 	= writable([]);
	let selectedDerivedNodeName			: string | null 			= null 
	let selectedDerivedNode				: Writable<GrobDerivedNode|null> = writable(null);
	// UIEventbools
	let derivedTransitionLevel0Ended = false;



	// Special Derieved UI
	let specialDerivedOpened = writable(false);
	 

	
	
	designer.subscribe( (d) => { 

		deSelectCollectionItem('fixed');
		deSelectCollectionItem('derived');

		if (!d)
			return;
		fixedCollection					.set(	d.fixed.getCollectionsNames().map( p => {return nameToIViewItem(p, p == selectedFixedCollectionName ) })	)
		selectedFixedCollectionData		.set([]);
		derivedCollection				.set(	d.derived.getCollectionsNames().map( p => {return nameToIViewItem(p, p == selectedDerivedCollectionName ) })	)
		selectedDerivedCollectionData	.set([]);
		selectedDerivedNode				.set(null); 

		let outputhandler = {
			_log		: [],
			_errors		: [],
			outError(msg)	{ this._errors.push(msg)	},
			outLog(msg)		{ this._log.push(msg)		}
		}
		d.setOut( outputhandler );
	})	
 
	function noteUpdate(){
		anyChanges = true;		

		// if there is no designer, return true, not because its valid, but to avoid complications
		if (!$designer)
			return true;

		// get a validation. 
		let messages : {msg:string, key:string[]}[]= [];
		valid = $designer.isValid( messages ) ;
		if (!valid){
			savingMessageHandler?.removeAllMessages();
			messages.forEach( msg => { 
				savingMessageHandler?.addMessageManual( msg.key , msg.msg, 'error');
			});
		}

	}
	async function GoToError( key : string ){
		
		const animationTime = 200;
		let segments = key.split(',');
		if( segments.length != 3){
			messageHandler?.addMessageManual( 'Error,InKey','Something Went Wrong going to Error','error')
			return;
		}
		
		// open the section
		let selectedCollectionName:string;
		let selectedNodeName:string
		
		if(segments[0] == 'fixed'){
			toogleFixedSection.toogle(true);
			toogleDerivedSection.toogle(false);
			selectedCollectionName	= selectedFixedCollectionName	?? '';
			selectedNodeName		= selectedFixedNodeName	?? '';
			await sleep(animationTime)
		} else {
			toogleDerivedSection.toogle(true);
			toogleFixedSection	.toogle(false);
			selectedCollectionName	= selectedDerivedCollectionName	?? '';
			selectedNodeName		= selectedDerivedNodeName	?? '';
			await sleep(animationTime)
		}
		
		if( selectedCollectionName != segments[1]){
			await sleep(animationTime)
			listViewFixed_1.select(segments[1]);
		}

		if( selectedNodeName != segments[2]){
			await sleep(animationTime)
			listViewFixed_2.select(segments[2]);
		}
	
	}
	

	function selectCollection ( type: 'derived' | 'fixed' , collection:string  ){
		
		// deSelectItem
		deSelectCollectionItem( type );

		// deselect if the collection is the same;
		if(collection == selectedFixedCollectionName ){
			selectedFixedCollectionName = null;
			if ( type == 'fixed' ){
				selectedFixedCollectionData.set([]);
				return true; 
			} else {
				selectedDerivedCollectionData.set([]);
				return true;
			}
		}

		// if there is no designer return
		if ( !$designer ){
			return false;
		}


		// map the names to IViewItems. 
		let selectedName = type == 'fixed' ? selectedDerivedCollectionName : selectedFixedCollectionName;
		let names = ($designer as TTRPGSystem).getCollection(type,collection)?.getNodeNames() ?? [];
		let mapped = names.map( p => {
			return nameToIViewItem(p, p == selectedName ) 
		} )
		
		 
	

		// save as correct collection
		if ( type == 'fixed' ){
			selectedFixedCollectionData.set(mapped);
			selectedFixedCollectionName = collection;
			return true; 
		} else {
			selectedDerivedCollectionData.set(mapped);
			selectedDerivedCollectionName = collection;
			return true;
		}
		
		return false;
	}
	function deSelectCollection ( type: 'derived' | 'fixed' ){
		
		deSelectCollectionItem(type)
		if ( type == 'fixed' ){
			selectedFixedCollectionName = null; 
			selectedFixedCollectionData.set([]);
			selectedFixedNode.set(null)
		} else {
			selectedDerivedCollectionName = null;
			selectedDerivedCollectionData.set([]);  
			selectedDerivedNode.set(null);
		} 

	}
	function addNewCollection(type: 'derived' | 'fixed' ){
		
		if ( !$designer ){
			return false;
		}

		function findNewCollectionName( name , level = 0 ){
			if ( !( $designer?.hasDerivedCollection(name + level) || $designer?.hasFixedCollection(name + level) )){
				return name + level;
			}
			else{
				return findNewCollectionName( name , level + 1);
			}
		}

		// first add the new item to the graph. 
		const name = findNewCollectionName('New Collection ');
		$designer.createCollection(type, name)
		
		// Add name to the propper list
		let addName = ( list ) => { 
			list.push(nameToIViewItem(name,false)); 
			return list
		}
		if (type == 'derived'){
			derivedCollection.update( addName )
		}else{
			fixedCollection.update( addName ) 
		}
		noteUpdate();
	}	


	function selectCollectionItem	( type: 'derived' | 'fixed' , collection:string, item:string   , noDeselect = false ){
		
		if (!designer){
			return false;
		}

		if (!collection){
			return false;
		}

		let object = ($designer as TTRPGSystem).getNode(type,collection,item);
		if (!object){
			return false;
		}
		 
		if (type == 'fixed'){
			selectedFixedNode.set(object as GrobFixedNode)
			selectedFixedNodeName = $selectedFixedNode?.name ?? null;
		} else {
			selectedDerivedNode.set(object as GrobDerivedNode);
			selectedDerivedNodeName = $selectedDerivedNode?.name  ?? null;
		}
		return true;
	}
	function deSelectCollectionItem	( type: 'derived' | 'fixed'){
		if (!designer){
			return false;
		}

		if (type == 'fixed'){
			selectedFixedNode.set(null)
			selectedFixedNodeName = null;
			selectedFixedCollectionData.update( r => {
				let index = r.findIndex( p => p.isSelected);
				if (index != -1 ){
					r[index].isSelected = false	
				}
				return r;
			})
		} else {
			selectedDerivedNode.set(null);
			selectedDerivedNodeName = null;
			selectedDerivedCollectionData.update( r => {
				let index = r.findIndex( p => p.isSelected);
				if (index != -1 ){
					r[index].isSelected = false	
				}
				return r;
			})
		}
	}
	function addNewCollectionItem	( type: 'derived' | 'fixed' , collection:string, item:string ){

		// if there is no S
		let selected = type == 'fixed' ? selectedFixedCollectionName : selectedDerivedCollectionName;
		if(!selected){
			return false;
		}

		if (!$designer){
			return false;
		}
		
		if (collection == ''){
			return false;
		}

		function findNewItemName( name ,collection, level = 0 ){
			if ( !( $designer?.hasDerivedNode(collection,name + level) || $designer?.hasFixedNode(collection,name + level) )){
				return name + level;
			}
			else{
				return findNewItemName( name ,collection, level + 1);
			}
		}

		// first add the new item to the graph. 
		const name = findNewItemName('New Item ', collection );
		$designer.createNode(type, collection, name)
		 
		// updateList 
		let selectedName = type == 'fixed' ? selectedFixedNodeName : selectedDerivedNodeName;
		let names = ($designer as TTRPGSystem).getCollection(type,collection)?.getNodeNames() ?? [];
		let mapped = names.map( p => {
			return nameToIViewItem(p, p == selectedName ) 
		} )
		if (type == 'derived'){
			selectedDerivedCollectionData	.set(mapped);
		}else{
			selectedFixedCollectionData		.set(mapped);
		}
		noteUpdate()
	}
	
	async function onSaveClick(){

		if (!$designer ){
			return;
		}

		let api = ObsidianUICoreAPI.getInstance();
		let response = await api.systemFactory.saveSystemDesigner( $systemPreview , $designer );
		if ( response.responseCode >= 200 && response.responseCode < 300 ){
			console.log('OK')
		}


	}

	function _UpdateViewItemName(collection : Writable<viewE[]> ,oldName,newName){
		// When saving an item, update the name from the old name to the new in the view. ( purely the view here )
		collection.update(r => {
			let curr ;
			for ( let i = 0 ; i < r.length ; i++){
				curr = r[i];
				if (curr.value == oldName){
					curr.value	= newName;
					curr.key	= newName;
					curr.isSelected = true;
				}
			}
			return r;
		}) 
	}
	function _updateItemName( group: 'fixed' |'derived' , collection: string | null , oldName : string , newName: string ){

	}
	function _deleteItem(isCollection:boolean, group: 'fixed' |'derived' , collection: string | null , name: string ){
		
	}

</script>


<div>

	{#if $designer}
		{#if anyChanges}
			<div
				class="GrobsInteractiveColoredBorder"
				data-state={ valid ? 'good' : 'error' }
				data-state-text={ valid ? 'Save system disabled while error persists' : 'Save System changed to file'}
				transition:slide
			>
				<StaticMessageHandler 
					bind:this={ savingMessageHandler }
					overrideClickText={'Click here to go to error'}
					overrideClick={ GoToError }
				/>
				<button on:click={onSaveClick}>Save Changes To File</button>
			</div>
		{/if}

		<ToogleSection 
			title={'Fixed Data Collections'} 
			bind:this={toogleFixedSection}
			on:close={ () => { deSelectCollection('fixed' )}}
		>
			<div class="SystemDesignerBlockSet">
				<div class="SystemDesignerListBlock" >
					<EditAbleListWritable 
						bind:this={ listViewFixed_1 }
						isEditableContainer={ true }
						collection		= { fixedCollection}
						onSelect		= { (e) => { return selectCollection('fixed',e,);} }
						onAdd			= { () => addNewCollection('fixed') }
						on:onDeSelect	= { (e) => { deSelectCollection('fixed') } }
						onUpdateItem	= { ( oldName, newName ) => _updateItemName('fixed', null, oldName, newName ) }
						onDeleteItem	= { ( name ) => _deleteItem(true,'fixed', null, name ) }
					/> 
				</div>
				<div class="SystemDesignerListBlock" >
					<EditAbleListWritable 
						bind:this={ listViewFixed_2 }
						isEditableContainer={ true }
						collection		= { selectedFixedCollectionData }
						onSelect		= { (e) => { return selectCollectionItem('fixed',selectedFixedCollectionName ?? '',e)} }
						onAdd			= { () => {addNewCollectionItem			('fixed',selectedFixedCollectionName ?? '', 'FixedItem ')} }
						on:onDeSelect	= { (e) => { deSelectCollectionItem		('fixed') } }
						onUpdateItem	= { ( oldName, newName ) => _updateItemName('fixed', selectedFixedCollectionName , oldName, newName ) }
						onDeleteItem	= { ( name ) => _deleteItem(false ,'fixed', selectedFixedCollectionName, name ) }
						disabled = { selectedFixedCollectionName == null}
					/> 
				</div>
			</div>
			
			<div class="SystemDesignerListBlock" >
				{#if $selectedFixedNode}
					<div class="lineBreak" transition:slide|local ></div>
					<div transition:slide|local >
						<FixedItemDesigner 
							on:save= { (e) => {
								_UpdateViewItemName ( selectedFixedCollectionData , e.detail.oldName  , e.detail.newName); 
								noteUpdate();
							}}
							node = { selectedFixedNode } 
							system = { designer }
						/>
					</div>
				{/if}
			</div>
		</ToogleSection>

		<ToogleSection 
			title={'Derived Data Collections'}  
			bind:this={toogleDerivedSection}
			on:close={ () => { deSelectCollection('derived' )}}
		>
			{#if $specialDerivedOpened} 
				<div  
					transition:slide|local  
					on:introstart={	() => { derivedTransitionLevel0Ended = false;	}} 
					on:introend={	() => { derivedTransitionLevel0Ended = true;	}} 
				> 
					<button on:click={ () =>{ specialDerivedOpened.update(r => !r) } }>X</button>
					<DerivedCollectionDesigner 
						on:save= { (e) => {
							//let _old = e.detail.old;
							//let _new = e.detail.new;
							//let result = $designer.renameCollection('derived',_old,_new);
							noteUpdate();
						}}
						goodTitle = "Collection Creator"
						badTitle = "Collection Creator : Error" 
						system = { designer }
						secondSlideInReady = { derivedTransitionLevel0Ended }
					/> 
				</div>
			{:else}
				<div  transition:slide|local >
					<div class="SystemDesignerBlockSet">
						<div class="SystemDesignerListBlock" >
							<EditAbleListWritable 
								bind:this={ listViewDerived_1 }
								isEditableContainer={ true }
								collection		= { derivedCollection}
								onSelect		= { (e) => { return selectCollection	('derived',e);} }
								onAdd			= { () =>	 addNewCollection	('derived')		}
								onSpecialAdd	= { () =>  { specialDerivedOpened.update( (r) => { return !r } ) ; deSelectCollection('derived') }}
								on:onDeSelect	= { (e) => { deSelectCollection	('derived')}	}
								onUpdateItem	= { ( oldName, newName ) => _updateItemName('derived', null, oldName, newName ) }
								onDeleteItem	= { ( name ) => _deleteItem(true,'derived', null, name ) }
							/> 
						</div>
						<div class="SystemDesignerListBlock" >
							<EditAbleListWritable 
								bind:this={ listViewDerived_2 }
								isEditableContainer={ true }
								collection		= { selectedDerivedCollectionData }
								onSelect		= { (e) => { return selectCollectionItem	('derived',selectedDerivedCollectionName ?? '',e)} }
								onAdd			= { () => {			addNewCollectionItem	('derived',selectedDerivedCollectionName ?? '', 'DerivedItem ')} }
								on:onDeSelect	= { (e) => { 		deSelectCollectionItem	('derived') } }
								onUpdateItem	= { ( oldName, newName ) => _updateItemName('derived', selectedDerivedCollectionName , oldName, newName ) }
								onDeleteItem	= { ( name ) => _deleteItem(false ,'derived', selectedDerivedCollectionName, name ) }
								disabled = { selectedDerivedCollectionName == null}
							/> 
						</div>
					</div> 
					<div class="SystemDesignerListBlock" >
						{#key ($selectedDerivedNode)?.getKey() }
							<div class="lineBreak" transition:slide|local ></div>
							<div transition:slide|local  
								on:introstart={	() => { derivedTransitionLevel0Ended = false;	}} 
								on:introend={	() => { derivedTransitionLevel0Ended = true;	}} 
							>
								{#if $selectedDerivedNode} 
									<DerivedItemDesigner 
										on:save= { (e) => {
											_UpdateViewItemName ( selectedDerivedCollectionData , e.detail.oldName  , e.detail.newName);
											noteUpdate();
										}}
										node = { selectedDerivedNode }
										system = { designer }
										secondSlideInReady = { derivedTransitionLevel0Ended }
									/>
								{/if}
							</div> 
						{/key}
					</div>
				</div>
			{/if}
		</ToogleSection>
		<div class="lineBreak"></div>
		 
	{/if}
	
	<StaticMessageHandler 
		bind:this={ messageHandler }
	/>
	
</div>
