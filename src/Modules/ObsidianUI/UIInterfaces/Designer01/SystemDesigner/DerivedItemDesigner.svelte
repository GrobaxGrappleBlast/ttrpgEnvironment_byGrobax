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
	let originEditorArray : {msg:string, type:'good'|'error'|'verbose',key:string}[] =[]
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

	export function TEMP_FROM_ORIGINEDITOR(){ 
		
		if (!$node || !$system)
			return;
		 
		try {

			// get data from originEditor.
			let calc = originEditor.getCurrentCalc();
			let _mappedOrigins = originEditor.getMappedOririns();

			// validate that all inCalc are finished
			let stopError = false;
			_mappedOrigins.forEach( o => {
				if (o.inCalc && !(o.target)){
					messageHandler.addMessageManual(o.key, `Cannot save until all dependencies used in the calc is defined \n ${o.key} Had no target` , 'error');
					stopError = true;
				}
			})
			if (stopError){
				return false;
			}
			
			//let test = node.parseCalculationToOrigins( calc );
			let deps = $node.getDependencies();
			deps.forEach(d => {
				$node.removeDependency(d);
			});

			// Set Calc and dependencies 
			$node.setCalc(calc);
			let NMap = _mappedOrigins.filter( p => p.inCalc );
		
			// first validate all.
			NMap.forEach( o => {	
				if (!o.segments){
					throw new Error(`Contents of ${o.key}'s segments was Null!'`);
				}
				
				let dep = $system.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
				if (!dep ){
					throw new Error(`Target of ${o.key} location ${o.segments[0] +'.'+ o.segments[1] +'.'+ o.segments[2] } was invalid!'`);
				}
			}); 
 
			// Then Save
			NMap.forEach( o => {
				let dep = $system.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
				if ( dep )
				$node.setOrigin( o.key , dep , o.testValue ?? 0 );
			}); 

			_mappedOrigins = NMap;
		} catch (e)
		{
			messageHandler.addMessageManual( 'exception', e , 'error');
			return false;
		}

		return true; 
	}
 
	async function save(){
		
		let release = await mutex.acquire();
		messageHandler.removeAllMessages();
		
		let originRes = originEditor.TEMP_FROM_ORIGINEDITOR();

		if (!originRes){
			originEditorArray.forEach( err => {
				messageHandler.addMessageManual(err.key,err.msg,err.type);
			});
		}else{
			messageHandler.addMessageManual('succes','Saved Node', 'good');
		}


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
				calc={$node.calc}
				node={$node}
				system={$system}
				mappedOrigins={$node.origins}
				bind:errors = {originEditorArray}
			/>
		{/if}
	</div> 
	<div class="ItemDesignerButtonRow">
		<button on:click={ save }  >save changes</button> 
	</div>
</div>