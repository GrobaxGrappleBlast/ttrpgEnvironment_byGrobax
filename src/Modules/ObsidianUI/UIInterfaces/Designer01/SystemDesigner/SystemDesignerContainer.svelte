<script lang="ts">
	import { writable, type Writable } from "svelte/store"; 
	import { GrobCollection, GrobDerivedNode, GrobDerivedOrigin, GrobFixedNode, TTRPGSystem, type GrobNodeType } from "../../../../../../src/Modules/Designer";
	import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import "./SystemDesigner.scss"; 
    import SystemDesignerDelegate from "./SystemDesignerDelegate.svelte";
    import { slide } from "svelte/transition";
    import DerivedCollectionDesigner from "./DerivedCollectionDesigner.svelte";
    import DerivedItemDesigner from "./DerivedItemDesigner.svelte";
    import ToogleSection from "../BaseComponents/ToogleSection/ToogleSection.svelte";
    

	export let system : Writable<TTRPGSystem>;  
	let messageHandler : StaticMessageHandler ;

	//status bools
	let editorOpen_specialDerivedItem	: boolean = false; 
	let editorOpen_derivedItem			: Writable<GrobDerivedNode|null> = writable(null);
	 
	// animation Booleans
	let animationBool_derivedEditor			= false; 


</script>
<div>
	<StaticMessageHandler 
		bind:this={messageHandler}
	/>
	<ToogleSection
		title={'Derived Item Design'}
	>
		<div class="linebreak" ></div>
		<SystemDesignerDelegate 
			designer = { system }
			messageHandler= { messageHandler}
			type		  = {'derived'}
			on:selectCollection= { (e) => { editorOpen_derivedItem.set(null); if(e.detail){ editorOpen_specialDerivedItem = false } } }
			on:selectItem= { (e) => { editorOpen_derivedItem.set(e.detail); editorOpen_specialDerivedItem = false } }
			onSpecialAdd = { ( ) => { editorOpen_specialDerivedItem = !editorOpen_specialDerivedItem; console.log('editorOpen_specialDerivedItem') }}
		/> 
		<div class="linebreak" ></div>
			{#if editorOpen_specialDerivedItem }
				<div transition:slide|local>
					<DerivedCollectionDesigner 
						system ={ system }
						secondSlideInReady={ true }
						goodTitle = {'Create New Collection'}
						badTitle  = {'Create New Collection - Error'}
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
							/>  
						</div>
					{/key}
				</div>
			{:else}
				<div transition:slide|local ></div>
			{/if} 
	</ToogleSection>
</div>