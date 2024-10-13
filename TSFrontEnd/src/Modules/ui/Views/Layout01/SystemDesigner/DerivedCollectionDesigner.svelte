<script lang="ts">  
	
    import { writable, type Writable, get } from 'svelte/store';  
    import { slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';   
    import { createEventDispatcher, onMount } from "svelte"; 
    import OriginRow 						from '../Views/OriginRow/OriginRow.svelte';
	import { TTRPGSystemJSONFormatting } 	from '../../../../../../src/Modules/graphDesigner';
    import ToogleSection 					from '../../../../../../src/Modules/ui/Components/toogleSection/toogleSection.svelte';
    import { DerivedCollectionController, originRowData, selAllInCollectionString } from './DerivedCollectionDesignerController';
	import StaticMessageHandler	from '../../../Components/Messages/StaticMessageHandler.svelte';
    import { Layout01Context } from '../context';
    import { UISystem } from '../../../../../../src/Modules/graphDesigner/UIComposition/UISystem';

	const dispatch = createEventDispatcher();  

	export let system : UISystem; 
	export let secondSlideInReady = false;
	export let goodTitle = "No Error";
	export let badTitle  = "Error"
	export let context	: Layout01Context; 
	export let messageHandler: StaticMessageHandler; 

	let controller : DerivedCollectionController = new DerivedCollectionController(); 
	$: controller.setControllerDeps( system )
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
		messageHandler?.removeError('save');
		controller.saveCollection();     
		dispatch('save');
	}
	function onGenPreviewToogle(){ 
		controller.generateNamePreview();		
	}
	 
	onMount(() => { 
		controller.setControllerDeps( system ); 
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
<div class="DerivedCollectionDesigner" data-state={  $controllerIsValid ? 'good' : 'error' } data-state-text={ $controllerIsValid ? goodTitle: badTitle}>
	<div class="DerivedCollectionDesignerCloseBtn" on:click={()=>dispatch('close')} on:keypress >X</div>
	
	<div>
		<p>
			Editing node.
			Here you can edit settings for this specific node. this edit is unique to this specific item.
		</p>
	</div>
	<div class="ItemDesigner_TwoColumnData" >

	</div>
	<div>  
		<div class="OriginEditor">
			<div class="derivedCollectionCalcStatementMatrix" >
				
				<div>new Collection Name</div>
				<textarea  class="calcInput ItemDesignerInput" on:input={ ( e ) => { onNameInput(e) } } contenteditable bind:value={ $controllerName }/>  


				<div data-succes={ $controllerNameResultSucces } >Name</div>
				<textarea class="calcInput"
					on:input={ onCalcNameInput }
					placeholder="insert Name Calc Statement here"
				/>
				<div class="derivedCalcStatementResult" data-succes={ $controllerNameResultSucces } >{ $controllerNameResultValue }</div>
				
				
				<div  data-succes={ $controllerResultSucces } >Calc</div>
				<textarea class="calcInput" value={ $controllerCalc } 
					on:input={ onCalcInput }
					placeholder="insert calcStatement here"
				/>
				<div class="derivedCalcStatementResult" data-succes={ $controllerResultSucces } >{ $controllerResultValue }</div>
				
			</div>
			<div class="derivedOriginRowsContainer">
				{#if $controllerMappedOrigin && secondSlideInReady }
					{#each $controllerMappedOrigin as origin (origin.key) }
						<div transition:slide|local class="derivedOriginRowContainer"> 
							<OriginRow 
								bind:rowData 	 = { origin }
								availableSymbols = { availableSymbols }
								system 			 = { system.sys }
								context = {context}
								on:onDelete 		= { onDeleteClicked }
								on:onSymbolSelected = { onKeyExchange }
								on:foundTargetNode = { (e) =>{ controller.checkIsValid(false) }}
								allowSelectAll = { true }
								SelectAllText = { selAllInCollectionString }
							/>
						</div>
					{/each}
				{/if}
			</div> 
		</div> 
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
	 