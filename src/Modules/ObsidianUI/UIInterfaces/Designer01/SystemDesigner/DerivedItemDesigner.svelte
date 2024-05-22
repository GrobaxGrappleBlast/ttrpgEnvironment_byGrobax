<script lang="ts">
	import OriginEditor from './views/OriginEditor.svelte';
    import { GrobDerivedNode, TTRPGSystem } from "../../../../Designer";
    import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import './ItemDesigner.scss'
    import { createEventDispatcher } from "svelte";
    import type { Writable } from 'svelte/store';

	export let node : Writable<GrobDerivedNode|null>;
	export let system : Writable<TTRPGSystem|null> ;

	let messageHandler: StaticMessageHandler;
	let valid : boolean = true;
	let dispatch = createEventDispatcher();

	let name =  $node?.getName()	?? 'name';
	let value = $node?.getValue();
	let flash = false;	
	node.subscribe(p => {
		name =  $node?.getName() ?? 'name';
		value = $node?.getValue() ;
		
		// flash as update
		flash = true;
		setTimeout( () => { flash = false} , 200)
		
	})
	function validateItem( _name : string , _value : string | number ){

		let isValid = true ;
	
		if ( !_value ){
			isValid = false;
			messageHandler.addMessageManual('1','No standard value found', 'error')
		}
		else if (   isNaN( parseFloat( _value + "" ) ) ){
			isValid = false;
			messageHandler.addMessageManual('1','Standard value was not a numeric value', 'error')
		} else {
			messageHandler.removeError('1');
		}


		// check the name
		if (_name.contains('.')){
			isValid = false;
			messageHandler.addMessageManual('2','The name cannot contain "."', 'error')
		}
		else if ( $node?.parent.hasNode( _name ) && name != $node?.getName() ){
			isValid = false;
			messageHandler.addMessageManual('2','The name is already in use, in the same collection', 'error')
		}else{
			messageHandler.removeError('2');
		}

		valid = isValid;
	}
	function validateInputChange ( nameEvent : any , valueEvent : any ){
		if(nameEvent){
			validateItem(nameEvent.target.value, value ?? "")
		}else{
			validateItem(name,valueEvent.target.value)
		}
	}
	function save(){
		validateItem(name,value ?? "");

		if (!valid)
			return;

		$node?.setName(name)
		$node?.setValue(value ?? 0)
		dispatch('save', {old:$node?.getName(), new:name});
	}
	


</script>
<div class="GrobsInteractiveColoredBorder" data-state={ flash ? 'flash' : valid ? 'good' : 'error' } data-state-text={'hej hans'}>
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

		<div>Node Name</div>
		<input type="text" class="ItemDesignerInput" on:input={ ( e ) => { validateInputChange(e,null) } }   contenteditable bind:value={name}/>

		<div>Node Location</div>
		<div class="ItemDesignerInput" >{ ($node?.parent?.parent?.name ?? 'unknown collection') + '.' +( $node?.parent?.name ?? 'unknown collection') + '.' + $node?.name}</div>

		<div>Standard Value</div>
		<input type="number" class="ItemDesignerInput" on:input={ ( e ) => { validateInputChange(null,e) } } contenteditable bind:value={value} />

	</div>
	<div>
		{#if $node && $system}
			<OriginEditor 
				node={$node}
				system={$system}
			/>
		{/if}
	</div>

	<div class="ItemDesignerButtonRow">
		<button on:click={ save } disabled={!valid} >save changes</button> 
	</div>
</div>