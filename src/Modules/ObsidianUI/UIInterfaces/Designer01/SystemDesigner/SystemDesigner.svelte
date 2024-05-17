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

	export let systemPreview : Writable<SystemPreview>;
	let loaded : boolean = false;
	let messageHandler : StaticMessageHandler;
	let designer : Writable<TTRPGSystem|null>  = writable(null);


	// ensure that the system is reloaded if the preview is reloaded. 
	onMount(()=>{	loadNewSystemDesign() })
	systemPreview.subscribe( (r) => { loadNewSystemDesign() })
	async function loadNewSystemDesign(){
		
		if(!systemPreview){
			messageHandler.removeAllMessages();
			messageHandler.addMessageManual('loadingtrouble','Something went wrong, and defined preview was null','error');
			return;
		}
		
		loaded = false;
		let api = ObsidianUICoreAPI.getInstance();
		let response = await api.systemFactory.getOrCreateSystemFactory( $systemPreview );
		if ( response.responseCode >= 200 && response.responseCode < 300 ){
			designer.set(response.response as TTRPGSystem);
		}

		messageHandler.removeAllMessages();
		for(const key in response.messages){
			messageHandler.addMessage(key,response.messages[key]);
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
	
	designer.subscribe( (d) => { 
		if (!d)
			return;
		fixedCollection					.set(	d.fixed.getCollectionsNames().map( p => {return nameToIViewItem(p, p == selectedFixedCollectionName ) })	)
		selectedFixedCollectionData		.set([]);
		derivedCollection				.set(	d.derived.getCollectionsNames().map( p => {return nameToIViewItem(p, p == selectedDerivedCollectionName ) })	)
		selectedDerivedCollectionData	.set([]);
		selectedDerivedNode				.set(null); 
	})	

	// fixed data
	let fixedCollection 				: Writable<viewE[]>	= writable([]);
	let selectedFixedCollectionName		: string | null 			= null
	let selectedFixedCollectionData		: Writable<viewE[]>	= writable([]);
	let selectedFixedNodeName			: string | null 			= null
	let selectedFixedNode				: Writable<GrobFixedNode | null> = writable(null);

	fixedCollection.subscribe( p => {
		console.log('fixedCollection updated')
	})

	// derived data
	let derivedCollection				: Writable<viewE[]>	= writable([]);
	let selectedDerivedCollectionName	: string | null 			= null
	let selectedDerivedCollectionData	: Writable<viewE[]> 	= writable([]);
	let selectedDerivedNodeName			: string | null 			= null 
	let selectedDerivedNode				: Writable<GrobDerivedNode|null> = writable(null);

	function selectCollection ( type: 'derived' | 'fixed' , collection:string ){
		if ( !$designer ){
			return false;
		}

		if ( type == 'fixed' ){
			let names = ($designer as TTRPGSystem).getFixedCollection(collection).getNodeNames();
			let mapped = names.map( p => {
				return nameToIViewItem(p, p == selectedFixedNodeName ) 
			} )
			selectedFixedCollectionData.set(mapped);
			return true; 
		} else {
			let names = ($designer as TTRPGSystem).getDerivedCollection(collection).getNodeNames();
			let mapped = names.map( p => {
				const selected = p == selectedDerivedNodeName;
				if ( selected && selectedDerivedNodeName != null ){
					let node = ($designer as TTRPGSystem).getDerivedNode( p , selectedDerivedNodeName );
					selectedDerivedNode.set(node);
				}
				return nameToIViewItem(p, p == selectedDerivedNodeName ) 
			} )
			selectedDerivedCollectionData.set(mapped);
			return true;
		}
		return false;
	}
	function deSelectCollection ( type: 'derived' | 'fixed' ){
		if ( type == 'fixed' ){
			selectedFixedCollectionName = null;
			selectedFixedNodeName = null;
		} else {
			selectedDerivedCollectionName = null;
			selectedDerivedNodeName = null;
			selectedDerivedNode.set(null);
		}
	}
	function addNewCollection(type: 'derived' | 'fixed' ){
		
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
		$designer?.createCollection(type, name)
		
		// Add name to the propper list
		let addName = ( list ) => { list.push(nameToIViewItem(name,false)); return list}
		if (type == 'derived'){
			derivedCollection.update( addName )
		}else{
			fixedCollection.update( addName ) 
		}
	}	

	function selectCollectionItem	( type: 'derived' | 'fixed' , collection:string| null, item:string ){
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
		 
		
		//if ( type == 'fixed' ) {
		//	selectedFixedCollectionData.set(mapped);
		//	return true; 
		//} else {
		//	selectedDerivedCollectionData.set(mapped);
		//	return true; 
		//}


		return true;
	}
	function deSelectCollectionItem	( type: 'derived' | 'fixed' , collection:string| null, item:string ){
		if (!designer){
			return false;
		}

	}
	function addNewCollectionItem	( type: 'derived' | 'fixed' , collection:string | null , item:string ){
		if (!designer){
			return false;
		}

	}
	
</script>
<div>
	{#if $designer}
		<ToogleSection  title={'Fixed Data Collections'} >
			<div class="SystemDesignerBlockSet">
				<div class="SystemDesignerListBlock" >
					<EditAbleListWritable 
						isEditableContainer={ true }
						collection		= { fixedCollection}
						onSelect		= { (e) => { return selectCollection('fixed',e);} }
						onAdd			= { () => addNewCollection('fixed') }
						on:onDeSelect	= { (e) => { deSelectCollection('fixed') } }
					/> 
				</div>
				<div class="SystemDesignerListBlock" >
					<EditAbleListWritable 
						isEditableContainer={ true }
						collection		= { selectedFixedCollectionData }
						onSelect		= { (e) => { return selectCollectionItem('fixed',selectedDerivedCollectionName,e)} }
						onAdd			= { () => {addNewCollectionItem('fixed',selectedDerivedCollectionName, 'FixedItem ')} }
						on:onDeSelect	= { (e) => { deSelectCollectionItem('fixed',selectedDerivedCollectionName ,e.detail) } }
					/> 
				</div>
			</div>
		</ToogleSection>


		<ToogleSection title={'Derived Data Collections'}  >

			
		</ToogleSection>
		 
	{/if}

	<StaticMessageHandler 
		bind:this={ messageHandler }
	/>

</div>
