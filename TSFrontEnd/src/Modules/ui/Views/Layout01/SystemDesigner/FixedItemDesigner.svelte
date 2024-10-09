<script context="module"  lang="ts">

	type originRowData = {key: string, segments:(string|null)[] , active :boolean , testValue :number, inCalc:boolean, target: GrobJNodeType | null , isSelectAllTarget: boolean };
	
	export class DerivedItemController{
		
		public node:GrobJFixedNode | null	= null ;
		public system:TTRPGSystemJSONFormatting | null	= null ;
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
		  

		private validateName( name , node:GrobJFixedNode , messageHandler: StaticMessageHandler | null = null , output:boolean ){
			let out = (key,msg,error) => { if(output){ messageHandler?.addMessageManual(key,msg,error) }}

			let isValid = true ; 
			// check the name
			if (name== ''){
				isValid = false;
				out('name','The name cannot be empty', 'error')
			}
			else if (name.includes('.')){
				isValid = false;
				out('name','The name cannot contain "."', 'error')
			}
			else if ( node.parent.hasNode( name ) && name != node.getName() ){
				isValid = false;
				out('name','The name is already in use, in the same collection', 'error')
			}else{
				//messageHandler?.removeError('name');
			}
			return isValid;
		} 
		private validateValue( value , node:GrobJFixedNode , messageHandler: StaticMessageHandler | null = null , output:boolean ){
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
			 
			//this.messageHandler?.removeAllMessages(); 
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
			
 
			// User information
			//	if (success){
			//		//this.messageHandler?.addMessageManual('save','Saved Node', 'good');
			//		
			//	} else {
			//		//this.messageHandler?.addMessageManual('save','Exception while trying to save Node in UI', 'error');
			//		return false;
			//	} 

			return true;
			
		} 
		public onKeyExchange( e ){ 
 
		}
		public onKeyDelete( e ){ 
			 
		} 
	}

</script> 
<script lang="ts">
	import { get, writable, type Writable } from 'svelte/store'; 
	

	import './ItemDesigner.scss'
    import { createEventDispatcher, onMount } from "svelte";
    import { GrobJFixedNode, GrobJNodeType, TTRPGSystemJSONFormatting } from '../../../../../../src/Modules/graphDesigner';
	import StaticMessageHandler from '../../../../../../src/Modules/ui/Components/Messages/StaticMessageHandler.svelte'

	export let node : GrobJFixedNode;
	export let system : TTRPGSystemJSONFormatting; 
	export let secondSlideInReady = false;
	export let goodTitle = "No Error";
	export let badTitle = "Error"

	const dispatch = createEventDispatcher(); 

	let controller : DerivedItemController = new DerivedItemController();
	$: controller.setControllerDeps(node,system)
	//$: controller.messageHandler = messageHandler; 
	let flash = false;	
	 
	let controllerName			: Writable<string>;
	let controllerValue			: Writable<number>;
	let controllerIsValid		: Writable<boolean>;

	// save original Name
	$: origName = node?.name ?? ''; 


	function onNameInput ( event : any  ){  
		//messageHandler?.removeError('save');
		let name = event.target.value;
		controller.name.set( name);
		controller.checkIsValid( );  
	}
	function onStandardValueInput ( event : any  ){  
		//messageHandler?.removeError('save');
		let name = event.target.value;
		controller.name.set( name);
		controller.checkIsValid( );  
	}
	 
	function onDeleteClicked(e){
		//messageHandler?.removeError('save');
		controller.onKeyDelete(e); 
		controller.checkIsValid( );  
	} 
	function onSave(){  
		//messageHandler?.removeError('save');
		if ( controller.saveNodeChanges() ){
			const oldName = origName;
			const newName = get(controller.name);
			dispatch('save', { oldName: oldName, newName : newName });
			origName = newName;
		}
	}
	
	onMount(() => { 
		controller.setControllerDeps( node , system ); 
		controller.checkIsValid();   
		controllerName			= controller.name;
		origName				= $controllerName;
		controllerValue			= controller.tempValue;
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