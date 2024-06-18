<script context="module"  lang="ts">

	type originRowData = {key: string, segments:(string|null)[] , active :boolean , testValue :number, inCalc:boolean, target: GrobNodeType | null , isSelectAllTarget: boolean };
	
	export class DerivedItemController{
		
		public node:GrobFixedNode | null	= null ;
		public system:TTRPGSystem | null	= null ;
		public messageHandler: StaticMessageHandler | null;

		public name 		: Writable<string>	= writable(''); 
		public tempValue	: Writable<number>	= writable(1);  
		public isValid		: Writable<boolean>	= writable(true);  

		public setControllerDeps( node, system, ){
			this.node = node;
			this.system = system;

			this.name 			.set(this.node?.name	?? '') 
			this.tempValue 		.set(0) 
			this.isValid 		.set(true) 
		}
		  

		private validateName( name , node:GrobFixedNode , messageHandler: StaticMessageHandler | null = null , output:boolean ){
			let out = (key,msg,error) => { if(output){ messageHandler?.addMessageManual(key,msg,error) }}

			let isValid = true ; 
			// check the name
			if (name== ''){
				isValid = false;
				out('name','The name cannot be empty', 'error')
			}
			else if (name.contains('.')){
				isValid = false;
				out('name','The name cannot contain "."', 'error')
			}
			else if ( node.parent.hasNode( name ) && name != node.getName() ){
				isValid = false;
				out('name','The name is already in use, in the same collection', 'error')
			}else{
				messageHandler?.removeError('name');
			}
			return isValid;
		} 
		private validateValue( value , node:GrobFixedNode , messageHandler: StaticMessageHandler | null = null , output:boolean ){
			let out = (key,msg,error) => { if(output){ messageHandler?.addMessageManual(key,msg,error) }}

			let isValid = true ;  
			return isValid;
		}
		private _checkIsValid(  output = true  ){
 
			if(!this.node || !this.system){ 
				return false;
			}

			let isValid = true; 

			// Check name is valid 
			isValid = isValid && this.validateName		( get(this.name) ?? '',  this.node , this.messageHandler , output );
			
			// Check value is valid 
			isValid = isValid && this.validateValue		( get(this.tempValue) ,  this.node , this.messageHandler , output );

			return isValid;

		}
		public checkIsValid( output = true ){  
			 
			this.messageHandler?.removeAllMessages(); 
			let valid = this._checkIsValid( output ); 
			this.isValid.set( valid ); 
			return valid;
		}   
		public saveNodeChanges( ){

	 
			let success = this.checkIsValid(true);
			if (!success){
				return false ;
			}

			

			// if the controller deps arent existing, return false; 
			if(!this.node || !this.system){ 
				return false;
			} 
			try{

				// save Name;
				this.node.setName(get(this.name))
				
				// save Temp Value;
				this.node.setValue(get(this.tempValue))
  
			} catch (e) {
				success = false;
				let err =  new Error('Exception while trying to save Node in UI' );
				err.stack += e.stack;
				throw err;
			}
 
			// User information
			if (success){
				this.messageHandler?.addMessageManual('save','Saved Node', 'good');
				return true;
			} else {
				this.messageHandler?.addMessageManual('save','Exception while trying to save Node in UI', 'error');
				return false;
			} 
			
		} 
		public onKeyExchange( e ){ 
 
		}
		public onKeyDelete( e ){ 
			 
		} 
	}

</script> 
<script lang="ts">
	import { get, writable, type Writable } from 'svelte/store'; 
    import { GrobFixedNode, TTRPGSystem, type GrobNodeType } from "../../../../../../src/Modules/Designer";
    import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import './ItemDesigner.scss'
    import { createEventDispatcher, onMount } from "svelte";

	export let node : Writable<GrobFixedNode|null>;
	export let system : Writable<TTRPGSystem|null>; 
	export let secondSlideInReady = false;
	export let goodTitle = "No Error";
	export let badTitle = "Error"

	let messageHandler: StaticMessageHandler;
	const dispatch = createEventDispatcher(); 

	let controller : DerivedItemController = new DerivedItemController();
	$: controller.setControllerDeps($node,$system)
	$: controller.messageHandler = messageHandler; 
	let flash = false;	
	 
	let controllerName			: Writable<string>;
	let controllerValue			: Writable<number>;
	let controllerIsValid		: Writable<boolean>;

	// save original Name
	let origName : string ; 


	function onNameInput ( event : any  ){  
		messageHandler?.removeError('save');
		let name = event.target.value;
		controller.name.set( name);
		controller.checkIsValid( );  
	}
	function onStandardValueInput ( event : any  ){  
		messageHandler?.removeError('save');
		let name = event.target.value;
		controller.name.set( name);
		controller.checkIsValid( );  
	}
	 
	function onDeleteClicked(e){
		messageHandler?.removeError('save');
		controller.onKeyDelete(e); 
		controller.checkIsValid( );  
	} 
	function onSave(){ 
 
		messageHandler?.removeError('save');
		if ( controller.saveNodeChanges() ){
			const oldName = origName;
			const newName = get(controller.name); 
			dispatch('save', { oldName: oldName, newName : newName });
			origName = newName;
		}
	}
	node.subscribe(p => {   
		if ( p?.getKey() == controller.node?.getKey() )
			return;
 
		controller.setControllerDeps( p , $system );
		
 		// flash as update
		flash = true;
		setTimeout( () => { flash = false} , 200)  
	})	
	onMount(() => { 
		controller.setControllerDeps( $node , $system ); 
		controller.checkIsValid();   
		controllerName			= controller.name;
		origName				= $controllerName;
		controllerValue			= controller.tempValue;
		controllerIsValid		= controller.isValid;
 
	})

</script>
<div class="GrobsInteractiveColoredBorder" data-state={ flash ? 'flash' : $controllerIsValid ? 'good' : 'error' } data-state-text={'hej hans'}>
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
		<input type="text" class="ItemDesignerInput" on:input={ onNameInput }   contenteditable bind:value={ $controllerName }/>

		<div>Node Location</div>
		<div class="ItemDesignerInput" >{ ($node?.parent?.parent?.name ?? 'unknown collection') + '.' +( $node?.parent?.name ?? 'unknown collection') + '.' + $node?.name}</div>

		<div>Standard Value</div>
		<input type="number" class="ItemDesignerInput" on:input={ onStandardValueInput } contenteditable bind:value={ $controllerValue } />

	</div>
	<div class="ItemDesignerButtonRow">
		<button on:click={ onSave } disabled={!$controllerIsValid} >save changes</button> 
		<button>delete</button> 
	</div>
</div>