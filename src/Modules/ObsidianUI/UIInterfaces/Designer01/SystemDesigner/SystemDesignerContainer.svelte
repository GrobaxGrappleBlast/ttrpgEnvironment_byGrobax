<script lang="ts">
	import { writable, type Writable } from "svelte/store"; 
	import { GrobCollection, GrobDerivedNode, GrobDerivedOrigin, GrobFixedNode, TTRPGSystem, type GrobNodeType } from "../../../../../../src/Modules/Designer";
	import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import "./SystemDesigner.scss"; 
    import SystemDesignerDelegate from "./SystemDesignerDelegate.svelte";
    

	export let system : Writable<TTRPGSystem>;  
	let messageHandler : StaticMessageHandler ;
	

</script>
<div>
	<StaticMessageHandler 
		bind:this={messageHandler}
	/>
	<SystemDesignerDelegate 
		designer = { system }
		messageHandler= { messageHandler}
		type		  = {'derived'}
	/> 
</div>