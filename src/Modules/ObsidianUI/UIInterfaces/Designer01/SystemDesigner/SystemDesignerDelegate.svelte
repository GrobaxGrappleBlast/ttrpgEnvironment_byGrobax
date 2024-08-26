<script lang="ts">
	
	import { SystemPreview } from "../../../../../../src/Modules/ObsidianUICore/model/systemPreview";
	import ToogleSection from "../BaseComponents/ToogleSection/ToogleSection.svelte";
	import EditableList from "../BaseComponents/editAbleList/EditAbleList.svelte";
	import { createEventDispatcher, onMount } from "svelte";
	import { get, writable, type Writable } from "svelte/store";
	import {ObsidianUICoreAPI} from '../../../../../../src/Modules/ObsidianUICore/API'
	import { GrobCollection, GrobDerivedNode, GrobDerivedOrigin, GrobFixedNode, GrobGroup, TTRPGSystem, type GrobNodeType } from "../../../../../../src/Modules/Designer";
	import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import "./SystemDesigner.scss";
	import EditAbleListWritable from "../BaseComponents/editAbleList/EditAbleListWritable.svelte";

	const dispatch = createEventDispatcher();   
	type viewE = {
		key:string;
		value:string;
		isSelected:boolean; 
	}
 
	export let designer : Writable<TTRPGSystem>;
	export let messageHandler : StaticMessageHandler ;
	export let type : 'derived' | 'fixed';
	export let onSpecialAdd : (() => any) | null = null ;
	let _onSpecialAdd = onSpecialAdd ? () =>{ deSelectCollection(); onSpecialAdd(); } : null;

	onMount(mount)
	function mount(){ 
		let data = $designer; 
		let colNames = data.getCollectionNames(type);
		collection.set( colNames.map( p => nameToIViewItem(p, false ) ))
	}

	export function forceUpdateItems(){
		
		let selectedItemKey = $selectedCollectionData.find( p => p.value == selectedNodeName)?.key;
		if (!selectedCollectionName){
			return;
		} 
		selectCollection( selectedCollectionName , false, false );
		
		
		let selectedItem = $selectedCollectionData.find( p => p.key == selectedItemKey)?.value;
		if (!selectedItem){
			return;
		}
		selectCollectionItem( selectedCollectionName , selectedItem , false , false )

	}

	export function renameSingleItem( oldKey:string, newKey:string , newValue:string ){
		selectedCollectionData.update( r => {
			let item = r.find(p => p.key == oldKey);
			if (!item)
				return r;

			item.key = newKey;
			item.value = newValue;

			return r;
		})
	}

	   
	// views 
	let collectionView		: EditAbleListWritable;
	let collectionItemView	: EditAbleListWritable;

	// state data  
	let collection 				: Writable<viewE[]>	= writable([]);
	let selectedCollectionName	: string | null 			= null
	let selectedCollectionData	: Writable<viewE[]>	= writable([]);
	let selectedNodeName		: string | null 			= null 

	function nameToIViewItem( name:string , isSelected:boolean ){
		return {
			key:name,
			value:name,
			isSelected:isSelected
		}
	}

	// Collection Functions 
	export function selectCollection ( collection:string , allowDeselect = true , dispatchEvent = true ){ 
		// deSelectItem
		deSelectCollectionItem();

		// deselect if the collection is the same;
		if(collection == selectedCollectionName && allowDeselect ){
			console.log('deselect')
			selectedCollectionName = null;
			selectedCollectionData.set([]);
			return true; 
		}

		// if there is no designer return
		if ( !$designer ){
			return false;
		} 

		// map the names to IViewItems.
		let collectionInstance = ($designer as TTRPGSystem).getCollection(type,collection);  
		let names = collectionInstance?.getNodeNames() ?? [];
		let mapped = names.map( p => {
			return nameToIViewItem(p, p == selectedCollectionName ) 
		} )

		selectedCollectionData.set(mapped);
		selectedCollectionName = collection;
			
		if (dispatchEvent){
			dispatch('selectCollection', collectionInstance );
		}
		return true; 
	}
	export function deSelectCollection ( dispatchEvent = true ){
		deSelectCollectionItem() 
		selectedCollectionName = null; 
		selectedCollectionData.set([]); 
		let prevSelItem = get(collection).find( p => p.isSelected );
		if(prevSelItem){
			prevSelItem.isSelected = false;
		}
		collection.update(r=>r);
		
		if (dispatchEvent){
			dispatch('selectCollection', null );
		}
	}
	function addNewCollection( ){
		
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
		 
		collection.update( addName )
		dispatch('change')   
	}	

	// Item Functions 
	export function selectCollectionItem	( collection:string, item:string , allowDeselect = true , dispatchEvent = true ){
		
		if (!designer){
			return false;
		}

		if (!collection){
			return false;
		}

		// incase the method is called from outside, we check if this collection is selected
		if ( collection != selectedCollectionName ){
			selectCollection(collection);
		}

		// deselect last 
		let prevSelItem = get(selectedCollectionData).find( p => p.isSelected );
		if(prevSelItem && allowDeselect){
			prevSelItem.isSelected = false;
		}

		// select the new 
		selectedNodeName = "";
		let selItem = get(selectedCollectionData).find( p => p.value == item );
		if(selItem){
			selItem.isSelected = true;
			selectedNodeName = item;
		}	

		// dispatch the update Event
		if(selItem && dispatchEvent){
			let actualItem = $designer.getNode(type , selectedCollectionName ?? '', selItem.value )
			dispatch('selectItem',actualItem);
		}

		if(selItem){
			return true
		}
		return false;
	}
	export function deSelectCollectionItem	( dispatchEvent = true ){
		if (!designer){
			return false;
		}

		// deselect last 
		let prevSelItem = get(selectedCollectionData).find( p => p.isSelected );
		if(prevSelItem){
			prevSelItem.isSelected = false;
		}
		selectedNodeName = '';

		if (dispatchEvent){
			dispatch('selectItem', null );
		}

		if (prevSelItem){
			return true;
		}
		return false; 
	}
	function addNewCollectionItem	(  collection:string, item:string , dispatchEvent = true){
		
		if (!$designer){
			return false;
		}
		
		if (!collection){
			return false;
		}

		// parse name 
		function findNewItemName( name ,collection, level = 0 ){
			if ( !( $designer?.hasNode(type,collection,name + level) )){
				return name + level;
			}
			else{
				return findNewItemName( name ,collection, level + 1);
			}
		}
		let foundName = findNewItemName(item, collection);

		// get the collection. 
		// add to factory - No UI update
		let createdItem = get(designer).createNode(type, collection, foundName);
		if (!createdItem){
			return false;
		}	

		// ad to UI
		if ( selectedCollectionName == collection){
			selectedCollectionData.update(r => {
				r.push(nameToIViewItem(foundName,false))
				return r
			});
		}
		dispatch('change')
	}

	// Model Operations And View Updates
	function _updateItemName( collection: string | null , dataArr:{ oldName : string , newName: string}[] ){
		 
		// if this is an update of a collection, collection ought be null
		if (collection == null ){
			for (let i = 0; i < dataArr.length; i++) {
				const curr = dataArr[i];
				let collection = $designer?.getCollection(type,curr.oldName);
				collection?.setName(curr.newName);
			}
			
			mount();
			// deselect collection. 
			//deSelectCollection(group);
		}

		// if this is an update of a node, then collection is not null. 
		else{

			for (let i = 0; i < dataArr.length; i++) {
				const curr = dataArr[i];
				let item = $designer?.getNode(type,collection,curr.oldName);
				item?.setName(curr.newName);
			}

			// will always be true, to satisfy the compuiler
			if (selectedCollectionName){
				selectCollection(selectedCollectionName, false);
			}

			//deSelectCollection(group);
			//selectCollection(group,collection);
			// deselct item.
			//deSelectCollectionItem(group)
		}

		dispatch('change')
		$designer = $designer;
	}
	function _deleteItem(isCollection:boolean , collection: string | null , name: string ){
		
		// if collection delete, delete collection
		if ( isCollection ){
			$designer?.deleteCollection(type,name);

			// deselct collection. 
			if ( selectedCollectionName == name ){
				deSelectCollection()
			}  
		}

		// if this is an item delete, delete item
		else {
			if(collection == null)
				throw new Error('Called delete item, on item, without defined collection');
			
			$designer?.deleteNode(type,collection,name);
			
			// deselct item. 
			if ( selectedCollectionName == name ){
				deSelectCollectionItem()
			} 
		}

		dispatch('change')
		$designer = $designer;
	}



</script>
 
 
<div class="SystemDesignerBlockSet">
	<div class="SystemDesignerListBlock" >
		<EditAbleListWritable 
			bind:this={ collectionView }
			isEditableContainer={ true }
			collection		= { collection }
			onSelect		= { (e) => { return selectCollection	(e);} }
			onAdd			= { () =>	 addNewCollection	()		}
			onSpecialAdd	= { _onSpecialAdd }
			on:onDeSelect	= { (e) => { deSelectCollection	()}	}
			onUpdateItem	= { ( array ) => _updateItemName( null, array ) }
			onDeleteItem	= { ( name ) => _deleteItem(true, null, name ) }
		/> 
	</div>
	<div class="SystemDesignerListBlock" >
		<EditAbleListWritable 
			bind:this={ collectionItemView }
			isEditableContainer={ true }
			collection		= { selectedCollectionData }
			onSelect		= { (e) => { return selectCollectionItem	(selectedCollectionName ?? '',e)} }
			onAdd			= { () => {			addNewCollectionItem	(selectedCollectionName ?? '', 'New Item ')} }
			on:onDeSelect	= { (e) => { 		deSelectCollectionItem	() } }
			onUpdateItem	= { ( array ) => _updateItemName (selectedCollectionName , array ) }
			onDeleteItem	= { ( name ) => _deleteItem(false , selectedCollectionName, name ) }
			disabled = { selectedCollectionName == null}
		/> 
	</div>
</div>  
 