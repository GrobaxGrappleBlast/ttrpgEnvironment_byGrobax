
<script lang="ts">   
    import { writable, type Writable, get } from 'svelte/store';  
    import { slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';  
    import { createEventDispatcher , onMount } from "svelte";
    import { DerivedItemController, originRowData } from './ItemControllers';
    import { GrobJDerivedNode, TTRPGSystemJSONFormatting } 	from '../../../../../../../../../src/Modules/graphDesigner';
	import StaticMessageHandler 							from '../../../../../../../../../src/Modules/ui/Components/Messages/StaticMessageHandler.svelte'
    import OriginRow 										from '../../../../Views/OriginRow/OriginRow.svelte';
    import { Layout01Context } 								from '../../../../context';
    import { UISystem }										from '../../../../../../../../../src/Modules/graphDesigner/UIComposition/UISystem';
    import { UINode }										from '../../../../../../../../../src/Modules/graphDesigner/UIComposition/UINode';

	export let node		: UINode;
	export let system	: UISystem; 
	export let goodTitle = "No Error";
	export let badTitle = "Error"
	export let context	: Layout01Context; 
	export let hideSave : boolean = false;
	export let hideName : boolean = false;
	export let hideDesc : boolean = false;
	export let hideLoc	: boolean = false;
	export let controller : DerivedItemController = new DerivedItemController();

	let messageHandler: StaticMessageHandler; 
	const dispatch = createEventDispatcher(); 
	
	$: controller.setControllerDeps(node,system,(msg) => {})
	$: controller.messageHandler = messageHandler;
	$: availableSymbols = get(controller.mappedOrigins).filter(p => !p.active ).map( p => p.key );
	
	export function forceUpdate(){
		controller.updateMappedOrigins()
	}
	export let onUpdate : () => any = () => null;
	// for use in Feature designer
	export function isValid(){
		return $controllerIsValid;
	}
	// for use in Feature designer
	export function getSetupData(){
		let orig = $controllerMappedOrigin.map( p => { return { symbol : p.key, locKey : p.target?.getLocationKey() }})
		let calc = $controllerCalc;
		let name = $controllerName; 
		return {
			name : name,
			calc : calc,
			orig : orig
		}
	}
	export function clearMessages(){
		messageHandler.removeAllMessages();
	}
	

	let controllerMappedOrigin	: Writable<originRowData[]>;
	let controllerResultValue	: Writable<number>;
	let controllerResultSucces	: Writable<boolean>;
	let controllerName			: Writable<string>;
	let controllerCalc			: Writable<string>;
	let controllerIsValid		: Writable<boolean>;

	// save original Name
	let origName : string ; 

	export function onNameInput ( event : any  ){  
		messageHandler?.removeError('save');
		let name = event.target.value;
		controller.name.set( name);
		controller.checkIsValid(false);  
	}
	export function onCalcInput ( event : any  ){
		let calc = event.target.value; 
		controller.calc.set( calc);
		messageHandler?.removeError('save');
		controller.recalculateCalcAndOrigins();  
		controller.checkIsValid(false);   
	}
	export function recalc( output = false ){
		controller.recalculateCalcAndOrigins();  
		controller.checkIsValid( output );   
	}

	function onDeleteClicked(e){
		messageHandler?.removeError('save');
		controller.onKeyDelete(e); 
		controller.checkIsValid(false);  
	}
	function onKeyExchange(e){
		messageHandler?.removeError('save');
		controller.onKeyExchange(e); 
		controller.checkIsValid(false);  
	}
	function onSave(){

		messageHandler?.removeError('save');
		if (controller.saveNodeChanges()){
			const oldName = origName;
			const newName = get(controller.name); 
			dispatch('save', { oldName: oldName, newName : newName });
			origName = newName;
		}
		 
	}
	onMount(() => { 
		controller.setControllerDeps(node,system,(msg) => {});
		controller.recalculateCalcAndOrigins()
		controller.checkIsValid(); 
		controllerMappedOrigin	= controller.mappedOrigins;
		controllerResultValue	= controller.resultValue;
		controllerResultSucces	= controller.resultSuccess;
		controllerName			= controller.name;
		controllerCalc			= controller.calc;
		controllerIsValid		= controller.isValid;
		origName = get(controller.name);

		controller.recalculateCalcAndOrigins();  
		controller.checkIsValid();   
	})

</script>

<div >
	<div>
		<StaticMessageHandler 
			bind:this={ messageHandler }
		/>
	</div>
	<div>
		{#if !hideDesc}
			<p>
				Editing node.
				Here you can edit settings for this specific node. this edit is unique to this specific item.
			</p>
		{/if}
	</div>
	<div class="ItemDesignerDataColumns3" >
		{#if !hideName}
			<div>Node Name</div>
			<input type="text" class="ItemDesignerInput" on:input={ ( e ) => { onNameInput(e) } } contenteditable bind:value={ $controllerName }/>
		{/if}

		{#if !hideLoc}
			<div>Node Location</div>
			<div class="ItemDesignerInput" >{ (node?.parent?.parent?.name ?? 'unknown collection') + '.' +( node?.parent?.name ?? 'unknown collection') + '.' + $controllerName }</div>
		{/if}

		<div>Calc</div>
		<textarea class="calcInput" value={ $controllerCalc } 
			on:input={ onCalcInput }
			placeholder="insert calcStatement here"
		/>

		<div class="derivedCalcStatementResult" data-succes={ $controllerResultSucces } >{ $controllerResultValue }</div>
	</div>
	<br>
	<div>
		{#if node && system }
			<div>
				<div class="derivedOriginRowsContainer" >
					{#if $controllerMappedOrigin }
						
						{#each $controllerMappedOrigin as origin (origin.key, origin.segments) }
							<div animate:flip transition:slide|local class="derivedOriginRowContainer"> 
								<OriginRow
									bind:rowData 	 = { origin }
									availableSymbols = { availableSymbols }
									system 			 = { system.sys }
									context = {context}
									on:change	= { () => recalc() }
									on:onDelete 		= { onDeleteClicked }
									on:onSymbolSelected = { onKeyExchange }
									on:foundTargetNode = { (e) =>{ controller.checkIsValid(false) }}
								/>
							</div>
						{/each}
					
					{/if}
				</div> 
			</div>
		{/if}
	</div> 
	<br>
	{#if !hideSave}
		<div class="ItemDesignerButtonRow">
			<button on:click={ onSave }  >save changes</button> 
		</div>
	{/if}
	<br><br>
</div>
 