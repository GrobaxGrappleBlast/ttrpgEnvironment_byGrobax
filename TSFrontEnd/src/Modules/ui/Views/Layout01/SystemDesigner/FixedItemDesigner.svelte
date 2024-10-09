<script lang="ts">
	import { get, writable, type Writable } from 'svelte/store'; 
	

	import './ItemDesigner.scss'
    import { createEventDispatcher, onMount } from "svelte";
    import { GrobJFixedNode, GrobJNodeType, TTRPGSystemJSONFormatting } from '../../../../../../src/Modules/graphDesigner';
	import StaticMessageHandler from '../../../../../../src/Modules/ui/Components/Messages/StaticMessageHandler.svelte'
    import { FixedItemController } from './ItemControllers';

	export let node : GrobJFixedNode;
	export let system : TTRPGSystemJSONFormatting; 
	export let secondSlideInReady = false;
	export let goodTitle = "No Error";
	export let badTitle = "Error"
	export let messageHandler : StaticMessageHandler;

	const dispatch = createEventDispatcher(); 

	let controller : FixedItemController = new FixedItemController();
	$: controller.setControllerDeps(node,system, (msg) => {} )
	//$: controller.messageHandler = messageHandler; 
	let flash = false;	
	 
	let controllerName			: Writable<string>;
	let controllerValue			: Writable<number>;
	let controllerIsValid		: Writable<boolean>;
	$: origName = node?.name ?? ''; 

	function onNameInput ( event : any  ){   
		let name = event.target.value;
		controller.name.set( name);
		controller.checkIsValid( );  
	}
	function onStandardValueInput ( event : any  ){   
		let name = event.target.value;
		controller.name.set( name);
		controller.checkIsValid( );  
	}
	 
	function onSave(){  
		if ( controller.saveNodeChanges() ){
			const oldName = origName;
			const newName = get(controller.name);
			dispatch('save', { oldName: oldName, newName : newName });
			origName = newName;
		}
	}
	
	onMount(() => { 
		controller.setControllerDeps( node , system , (msg) => {} ); 
		controller.checkIsValid();   
		controllerName			= controller.name;
		origName				= $controllerName;
		controllerValue			= controller.standardValue;
		controllerIsValid		= controller.isValid; 
	})

</script>
<div class="GrobsInteractiveColoredBorder" data-state={ flash ? 'flash' : $controllerIsValid ? 'good' : 'error' } data-state-text={'hej hans'}>
	<div>
		<p>
			Editing node.
			Here you can edit settings for this specific node. this edit is unique to this specific item.
		</p>
	</div>
	<div class="ItemDesigner_TwoColumnData" >

		<div>Node Name</div>
		<input type="text" class="ItemDesignerInput" on:input={ onNameInput }   contenteditable bind:value={ $controllerName }/>

		<div>Node Location</div>
		<div class="ItemDesignerInput" >{ (node?.parent?.parent?.name ?? 'unknown collection') + '.' +( node?.parent?.name ?? 'unknown collection') + '.' + node?.name}</div>

		<div>Standard Value</div>
		<input type="number" class="ItemDesignerInput" on:input={ onStandardValueInput } contenteditable bind:value={ $controllerValue } />

	</div>
	<div class="ItemDesignerButtonRow">
		<button on:click={ onSave } disabled={!$controllerIsValid} >save changes</button> 
		<button>delete</button> 
	</div>
</div>