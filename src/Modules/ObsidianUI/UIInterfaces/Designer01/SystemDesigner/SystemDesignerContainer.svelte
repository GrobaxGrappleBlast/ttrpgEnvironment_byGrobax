<script lang="ts">
	import { writable, type Writable } from "svelte/store"; 
	import { GrobJDerivedNode, GrobJFixedNode, TTRPGSystemJSONFormatting } from "../../../../../../src/Modules/Designer/index";
	import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte"// "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import "./SystemDesigner.scss"; 
    import SystemDesignerDelegate from "./SystemDesignerDelegate.svelte";
    import { slide } from "svelte/transition";
    import DerivedCollectionDesigner from "./DerivedCollectionDesigner.svelte";
    import DerivedItemDesigner from "./DerivedItemDesigner.svelte";
    import ToogleSection from "../BaseComponents/ToogleSection/ToogleSection.svelte";
    import { onMount } from "svelte";
    import FixedItemDesigner from "./FixedItemDesigner.svelte";
    import { ObsidianUICoreAPI } from "../../../../../../src/Modules/ObsidianUICore/API";
    import { SystemPreview } from "../../../../../../src/Modules/ObsidianUICore/model/systemPreview";
    

	export let system : Writable<TTRPGSystemJSONFormatting>;  
	export let preview	: Writable<SystemPreview> = writable();
	let messageHandler : StaticMessageHandler ;

	//status bools
	let editorOpen_specialDerivedItem	: boolean = false; 
	let editorOpen_derivedItem			: Writable<GrobJDerivedNode|null> = writable(null);
	let editorOpen_fixedItem			: Writable<GrobJFixedNode|null> = writable(null);
	 
	// animation Booleans
	let animationBool_derivedEditor			= false; 

	// views 
	let fixedDesigner : SystemDesignerDelegate;
	let derivedDesigner : SystemDesignerDelegate;
	let toogleFixedSection	: ToogleSection;
	let toogleDerivedSection: ToogleSection;
 
	// Saving Variables 
	let anyChanges  = false;
	let valid 		= true;
	let savingMessageHandler: StaticMessageHandler; 

	async function GoToError( type:string , key : string ){

		if (type != 'error')
			return false;

		editorOpen_specialDerivedItem = false;
		editorOpen_derivedItem	.set(null);
		editorOpen_fixedItem	.set(null);

		let segments = key.split('.');
		if( segments.length != 3){
			messageHandler?.addMessageManual( 'Error,InKey','Something Went Wrong going to Error','error')
			return false;
		}

		if (segments[0] == 'derived'){
			toogleDerivedSection.toogle(true);
			toogleFixedSection	.toogle(false);
			derivedDesigner		.selectCollectionItem(segments[1],segments[2],true,true)
		}
		else if (segments[0] == 'fixed'){
			toogleFixedSection	.toogle(true);
			toogleDerivedSection.toogle(false);
			fixedDesigner		.selectCollectionItem(segments[1],segments[2],true,true)
		}
		return true;

	} 
	function validateForSave(){
		 
		anyChanges = true;

		// if there is no designer, return true, not because its valid, but to avoid complications
		if (!$system)
			return false;

		// get a validation. 
		let messages : {msg:string, key:string[]}[]= [];
		valid = $system.isValid( messages ) ;
		if (!valid){
			savingMessageHandler?.removeAllMessages();
			messages.forEach( msg => { 
				savingMessageHandler?.addMessageManual( msg.key , msg.msg, 'error');
			});
		}

		return valid;
	}
 	async function onSaveClick(){
	 
		if (!$system ){
			return;
		}

		let api = ObsidianUICoreAPI.getInstance(); 
		let response = await api.systemFactory.saveSystemDesigner( $preview , $system );
		if ( response.responseCode >= 200 && response.responseCode < 300 ){
			savingMessageHandler?.addMessageManual( 'saved' , 'Succesfully saved System', 'good');
			anyChanges = false;
		}
		
	}


	onMount(()=>{
		debugger
	})

</script>
<div>
	<div
		class="GrobsInteractiveColoredBorder"
		data-state={ (!anyChanges) ? 'none' : valid ? 'good' : 'error' }
		data-state-text={ (!anyChanges) ? 'No Changes yet to save' :  valid ? 'Save System to file' : 'Save system disabled while error persists' } 
	>
		<StaticMessageHandler 
			bind:this={ savingMessageHandler }
			overrideClickTextError={'Click here to go to error'}
			overrideClick={ GoToError }
		/>
		<div class="linebreak" ></div>
		<button on:click={onSaveClick}>{ (!anyChanges) ? 'resave the file' : 'Save To File'}</button>
	</div> 

	<div class="linebreak" ></div>

	<StaticMessageHandler 
		bind:this={messageHandler}
	/>
	
	<ToogleSection
		title={'Fixed Item Design'}
		bind:this={toogleFixedSection}
		on:close = { () => { editorOpen_specialDerivedItem=false;} }
	>
		<div>
			<h1>Fixed Item Design</h1>
			<p>
				Fixed properties are the properties that are defiend on each article's meta data.
			</p>
		</div>
		<div class="linebreak" ></div>
		<SystemDesignerDelegate 
			bind:this={fixedDesigner}
			designer = { system }
			messageHandler= { messageHandler}
			type		  = {'fixed'}
			on:change={ validateForSave }
			on:selectCollection	= { (e) => { editorOpen_fixedItem.set(null);	} }
			on:selectItem		= { (e) => { editorOpen_fixedItem.set(e.detail);} } 
		/> 
		<div class="linebreak" ></div>
		{#if $editorOpen_fixedItem } 
			<div transition:slide|local >
				{#key $editorOpen_fixedItem?.name}
					<div transition:slide|local >
						<FixedItemDesigner
							node = { editorOpen_fixedItem } 
							system ={ system }  
							goodTitle = {' Item Designer '}
							badTitle  = {' Item Designer - Error '}
							on:save={ (e)=>{ fixedDesigner.renameSingleItem(e.detail.oldName, e.detail.newName,  e.detail.newName);  validateForSave(); } }
						/>  
					</div>
				{/key}
			</div>
		{:else}
			<div transition:slide|local ></div>
		{/if} 
	</ToogleSection>

	<div class="linebreak" ></div>

	<ToogleSection
		title={'Derived Item Design'}
		bind:this={toogleDerivedSection}
		on:close = { () => { editorOpen_specialDerivedItem=false;} }
	>
		<div>
			<h1>Derived Item Design</h1>
			<p>
				Derived properties are the data, that are derived from fixedData
			</p>
		</div>
		<div class="linebreak" ></div>
		<SystemDesignerDelegate 
			designer = { system }
			messageHandler= { messageHandler}
			type		  = {'derived'}
			bind:this={derivedDesigner}
			on:change={ validateForSave }
			on:selectCollection	= { (e) => { editorOpen_derivedItem.set(null); if(e.detail){ editorOpen_specialDerivedItem = false } } }
			on:selectItem		= { (e) => { editorOpen_derivedItem.set(e.detail); editorOpen_specialDerivedItem = false } }
			onSpecialAdd 		= { ( ) => { editorOpen_specialDerivedItem = !editorOpen_specialDerivedItem; console.log('editorOpen_specialDerivedItem') }}
		/> 
		<div class="linebreak" ></div>
			{#if editorOpen_specialDerivedItem }
				<div transition:slide|local>
					<DerivedCollectionDesigner 
						system ={ system }
						secondSlideInReady={ true }
						goodTitle = {'Create New Collection'}
						badTitle  = {'Create New Collection - Error'}
						on:save={validateForSave}
					/>
				</div> 
			{:else if $editorOpen_derivedItem } 
				<div transition:slide|local >
					{#key $editorOpen_derivedItem?.name}
						<div transition:slide|local >
							<DerivedItemDesigner
								node = { editorOpen_derivedItem } 
								system ={ system }  
								goodTitle = {' Item Designer '}
								badTitle  = {' Item Designer - Error '}
								on:save={ (e)=>{ derivedDesigner.renameSingleItem(e.detail.oldName, e.detail.newName,  e.detail.newName) ; validateForSave();} }
							/>  
						</div>
					{/key}
				</div>
			{:else}
				<div transition:slide|local ></div>
			{/if} 
	</ToogleSection>

 

</div>