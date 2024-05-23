<script lang="ts">
	import OriginEditor from './views/OriginEditor.svelte';
    import { GrobDerivedNode, TTRPGSystem } from "../../../../Designer";
    import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import './ItemDesigner.scss'
    import { createEventDispatcher } from "svelte";
    import type { Writable } from 'svelte/store';
    import { FileContext } from '../../../../../../src/Modules/ObsidianUICore/fileContext';
	import { Mutex } from "async-mutex";

	export let node : Writable<GrobDerivedNode|null>;
	export let system : Writable<TTRPGSystem|null> ;

	let messageHandler: StaticMessageHandler;
	let originEditor : OriginEditor;
	let valid : boolean = true;
	let dispatch = createEventDispatcher();
	let mutex:Mutex = new Mutex();

	let name =  $node?.getName()	?? 'name'; 
	let flash = false;	
	node.subscribe(p => {
		name =  $node?.getName() ?? 'name';
		 
		// flash as update
		flash = true;
		setTimeout( () => { flash = false} , 200)
		
	})
	function validateItem( _name : string ){

		let isValid = true ;
	
	 
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
			validateItem(nameEvent.target.value)
		}else{
			validateItem(name )
		}
	}
	async function save(){

		let release = await mutex.acquire();
		messageHandler.removeAllMessages();
		
		// validate base item
		validateItem(name );
		
		// validate origins
		let originRes = originEditor.trySave();
		let originValid = originRes.errorMessages.length == 0;
		if( !originValid ){
			let c = 0;
			originRes.errorMessages.forEach( msg => {
				messageHandler.addMessageManual( 'OriginError ' + c++ , msg, 'error' );
			});
		}

		// if it is not valid we dont save
		valid = valid && originValid;
		if ( valid ){
			release();
			return;
		}

		$node?.setName(name) 
		dispatch('save', {old:$node?.getName(), new:name});

		release();
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
 
	</div>
	<div>
		{#if $node && $system}
			<OriginEditor
				bind:this={originEditor} 
				node={$node}
				system={$system}
			/>
		{/if}
	</div>

	<div class="ItemDesignerButtonRow">
		<button on:click={ save }  >save changes</button> 
	</div>
</div>