<script context="module"  lang="ts">
	import ToogleSection from './../BaseComponents/ToogleSection/ToogleSection.svelte';
	import {DerivedCollectionController , selAllInCollectionString , originRowData} from './DerivedCollectionDesignerController';
</script> 
<script lang="ts"> 
    import { GrobDerivedNode, TTRPGSystem, type GrobNodeType } from "../../../../Designer";
    import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import './ItemDesigner.scss' 
    import { writable, type Writable, get } from 'svelte/store'; 
	import OriginRow from "./views/OriginRow.svelte";
    import { slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';   
    import { createEventDispatcher, onMount } from "svelte";
    import { DerivedItemController } from "./DerivedItemDesigner.svelte";
	const dispatch = createEventDispatcher();  

	export let system : Writable<TTRPGSystem|null>; 
	export let secondSlideInReady = false;
	export let goodTitle = "No Error";
	export let badTitle  = "Error"

	let messageHandler: StaticMessageHandler; 

	let controller : DerivedCollectionController = new DerivedCollectionController(); 
	$: controller.setControllerDeps( $system )
	$: controller.messageHandler = messageHandler;
	$: availableSymbols = get(controller.mappedOrigins).filter(p => !p.active ).map( p => p.key );  
	 
	let controllerMappedOrigin	: Writable<originRowData[]>;
	let controllerResultValue	: Writable<number>;
	let controllerResultSucces	: Writable<boolean>;
	let controllerNameResultSucces	: Writable<boolean>;
	let controllerNameResultValue	: Writable<string> ;  
	let controllerName			: Writable<string>;
	let controllerCalc			: Writable<string>;
	let controllerIsValid		: Writable<boolean>; 
	let generativeNameListData 	: Writable<string[]>	;

	function onNameInput ( event : any  ){  
		messageHandler?.removeError('save');
		let name = event.target.value;
		controller.name.set( name);
		controller.checkIsValid(false);  
	}
	function onCalcNameInput ( event : any  ){  
		messageHandler?.removeError('save');
		let nameCalc = event.target.value;
		controller.nameCalc.set( nameCalc );
		controller.checkIsValid(false);  
	} 
	function onCalcInput ( event : any  ){ 
		let calc = event.target.value; 
		controller.calc.set( calc);
		messageHandler?.removeError('save');
		controller.recalculateCalcAndOrigins();  
		controller.checkIsValid(false);    
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
		debugger
		messageHandler?.removeError('save');
		controller.saveCollection();     
		dispatch('save');
	}
	function onGenPreviewToogle(){ 
		controller.generateNamePreview();		
	}
	 
	onMount(() => { 
		controller.setControllerDeps( $system ); 
		controller.recalculateCalcAndOrigins()
		controller.checkIsValid(); 
		controllerMappedOrigin	= controller.mappedOrigins;
		controllerResultValue	= controller.resultValue;
		controllerResultSucces	= controller.resultSuccess;
		controllerNameResultSucces	= controller.resultNameSuccess;
		controllerNameResultValue	= controller.resultNameValue;
		controllerName			= controller.name;
		controllerCalc			= controller.calc;
		controllerIsValid		= controller.isValid; 
		generativeNameListData 	= controller.generativeNameListData ;
	})

</script> 
<div class="GrobsInteractiveColoredBorder" data-state={  $controllerIsValid ? 'good' : 'error' } data-state-text={ $controllerIsValid ? goodTitle: badTitle}>
	<div>
		<StaticMessageHandler 
			bind:this={ messageHandler }
		/>
	</div>
	<div>
		<p>
			Editing node.
			Here you can edit settings for this specific node. this edit is unique to this specific item.
		</p>
	</div>
	<div class="ItemDesigner_TwoColumnData" >

		<div>new Collection Name</div>
		<input type="text" class="ItemDesignerInput" on:input={ ( e ) => { onNameInput(e) } } contenteditable bind:value={ $controllerName }/>  
	</div>
	<div> 
		{#if $system }
			<div class="OriginEditor">
				<div class="derivedCollectionCalcStatementMatrix" >
					 
						<div data-succes={ $controllerNameResultSucces } >Name</div>
						<input type="text"  
							on:input={ onCalcNameInput }
							placeholder="insert Name Calc Statement here"
						/>
						<div class="derivedCalcStatementResult" data-succes={ $controllerNameResultSucces } >{ $controllerNameResultValue }</div>
					 
					 
						<div  data-succes={ $controllerResultSucces } >Calc</div>
						<input type="text" value={ $controllerCalc } 
							on:input={ onCalcInput }
			 				placeholder="insert calcStatement here"
						/>
						<div class="derivedCalcStatementResult" data-succes={ $controllerResultSucces } >{ $controllerResultValue }</div>
					 
					 
				</div>
				<div class="derivedOriginRowsContainer">
					{#if $controllerMappedOrigin && secondSlideInReady }
						<div transition:slide|local >
							{#each $controllerMappedOrigin as origin (origin.key) }
								<div transition:slide|local class="derivedOriginRowContainer"> 
									<OriginRow 
										bind:rowData 	 = { origin }
										availableSymbols = { availableSymbols }
										system 			 = { $system }
										on:onDelete 		= { onDeleteClicked }
										on:onSymbolSelected = { onKeyExchange }
										on:foundTargetNode = { (e) =>{ controller.checkIsValid(false) }}
										allowSelectAll = { true }
										SelectAllText = { selAllInCollectionString }
									/>   
								</div>
							{/each}
						</div>
					{/if}
				</div> 
			</div>
		{/if}
	</div> 
	<br>
	<div class="ItemDesignerButtonRow">
		<button on:click={ onSave }  >save changes</button> 
		<button on:click={ onGenPreviewToogle }  >Generate Name Preview</button> 
	</div>
	<div>
		<ToogleSection title="preview Names">
			{#each $generativeNameListData as name (name) }
				<div animate:flip transition:slide|local class="derivedOriginRowContainer"> 
						{name}
				</div>
			{/each}
		</ToogleSection>
	</div>
	
</div> 
	 