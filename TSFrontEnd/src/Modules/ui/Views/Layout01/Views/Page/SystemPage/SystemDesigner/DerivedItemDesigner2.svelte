
<script lang="ts">   
    import { writable, type Writable, get } from 'svelte/store';  
    import { slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';  
    import { createEventDispatcher , onMount } from "svelte";
    import { DerivedItemController2, originRowData } from './ItemControllers';
    import { GrobJDerivedNode, IFeatureAllCombined, TTRPGSystemJSONFormatting } 	from '../../../../../../../graphDesigner';
	import StaticMessageHandler 							from '../../../../../../Components/Messages/StaticMessageHandler.svelte'
    import OriginRow 										from '../../../OriginRow/OriginRow.svelte';
    import { Layout01Context } 								from '../../../../context';
    import { UISystem }										from '../../../../../../../graphDesigner/UIComposition/UISystem';

	export let node		: IFeatureAllCombined;
	export let system	: UISystem; 
	export const goodTitle = "No Error";
	export const badTitle = "Error"
	export let context	: Layout01Context; 
	export const hideSave	: boolean = false;
	export const hideName	: boolean = false;
	export const hideDesc	: boolean = false;
	export const hideLoc 	: boolean = false;

	let messageHandler: StaticMessageHandler;  
 
	let mappedOrigin		: originRowData[] = [];
	let resultValue			: number	= NaN;
	let resultSucces		: boolean	= false;
	let name				: string	= '';
	let calc				: string	= "@a";
	let isValid				: boolean	= false;
	let availableSymbols 	: string[]	= [];
	let messagesAsEvents 	: boolean	= false;

	export let controller : DerivedItemController2 = new DerivedItemController2();

	function errorOut( msg : string ){
		messageHandler.addMessageManual( msg, msg , 'error');
	}
	export function onNameInput ( event : any  ){  
		messageHandler?.removeError('save');
		evaluate();  
	}
	export function onCalcInput ( event : any  ){
		
		// remove saved message. 
		messageHandler?.removeError('save');
		evaluate();

	}
	export function recalc( output = false ){ 
		evaluate();
	}
	export function getIsValid(){
		return isValid;
	}	

	function evaluate(){

		// remove saved message. 
		messageHandler?.removeError('save');
		let messages = {};
		//	controller.checkIsValid (
		//		system	,
		//		( key , msg ) => { messages[key] = msg },
		//		calc		,
		//		mappedOrigin,
		//		name		,
		//		
		//		true
		//	);
		debugger;
		
		let res = controller.recalculate( calc , mappedOrigin , (key :string , msg:string) => {} );
		isValid = res.succes;
		resultSucces = res.succes;
		resultValue = res.value;
		mappedOrigin= res.origins;
	}
	function onDeleteClicked( key ){
		messageHandler?.removeError('save');
		mappedOrigin = mappedOrigin.filter( p => p.key != key );
		evaluate(); 
	}
	function onKeyExchange(e){
		messageHandler?.removeError('save'); 
	}
	function onSave(){

		messageHandler?.removeError('save');
		//if (controller.saveNodeChanges()){
		//	const oldName = origName;
		//	const newName = get(controller.name); 
		//	dispatch('save', { oldName: oldName, newName : newName });
		//	origName = newName;
		//}
		 
	}

	onMount(() => { 
		evaluate();
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
		<div style="grid-column:span 3;">
			{#if isValid}
				check
			{:else}
				slash
			{/if}
		</div>

		{#if !hideName}
			<div>Node Name</div>
			<input 
				type="text" 
				class="ItemDesignerInput" 
				on:input={ ( e ) => { onNameInput(e) } } 
				contenteditable 
				bind:value={ name }
			/>
		{/if}

		<div>Calc</div>
		<textarea class="calcInput" bind:value={ calc } 
			on:input={ onCalcInput }
			placeholder="insert calcStatement here"
		/>

		<div class="derivedCalcStatementResult" data-succes={ resultSucces } >{ resultValue }</div>
	</div>
	<br>
	<div>
		{#if node && system }
			<div>
				<div class="derivedOriginRowsContainer" >
					{#if mappedOrigin }
						{#each mappedOrigin as origin (origin.key, origin.segments) }
							<div animate:flip transition:slide|local class="derivedOriginRowContainer"> 
								<OriginRow
									bind:rowData 	 = { origin }
									availableSymbols = { availableSymbols }
									system 			 = { system.sys }
									context = {context}
									on:change	= { () => recalc() }
									on:onDelete 		= { () => onDeleteClicked(origin.key) }
									on:onSymbolSelected = { onKeyExchange }
									on:foundTargetNode = { () => recalc() }
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
 