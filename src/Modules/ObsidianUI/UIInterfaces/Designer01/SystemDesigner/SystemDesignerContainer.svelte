<script lang="ts">
	import { writable, type Writable } from "svelte/store"; 
	import { GrobCollection, GrobDerivedNode, GrobDerivedOrigin, GrobFixedNode, TTRPGSystem, type GrobNodeType } from "../../../../../../src/Modules/Designer";
	import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import "./SystemDesigner.scss"; 
    import SystemDesignerDelegate from "./SystemDesignerDelegate.svelte";
    import { slide } from "svelte/transition";
    

	export let system : Writable<TTRPGSystem>;  
	let messageHandler : StaticMessageHandler ;
	
	let editorOpen_specialDerivedItem	: boolean = false; 
	let editorOpen_derivedItem			: any = false;
	let editorOpen_fixedItem			: any = false;

</script>
<div>
	<StaticMessageHandler 
		bind:this={messageHandler}
	/>
	<SystemDesignerDelegate 
		designer = { system }
		messageHandler= { messageHandler}
		type		  = {'derived'}
		on:selectCollection= { (e) => { editorOpen_derivedItem = null; if(e.detail){ editorOpen_specialDerivedItem = false } } }
		on:selectItem= { (e) => { editorOpen_derivedItem = e.detail} }
		onSpecialAdd = { () => { editorOpen_specialDerivedItem = !editorOpen_specialDerivedItem; console.log('editorOpen_specialDerivedItem') }}
	/> 
	{#if editorOpen_specialDerivedItem }
		<div transition:slide >
			HEJ HANS editorOpen_specialDerivedItem
		</div> 
	{:else if editorOpen_derivedItem}
		<div transition:slide >
			HEJ HANS editorOpen_derivedItem
		</div>
	{/if}
</div>