<script context="module"  lang="ts">

	type originRowData = {key: string, segments:(string|null)[] , active :boolean , testValue :number, inCalc:boolean, target: GrobNodeType | null };
	export class DerivedItemController{
		
		private node:GrobDerivedNode | null	= null ;
		private system:TTRPGSystem | null	= null ;
		public messageHandler: StaticMessageHandler | null;
		public setControllerDeps( node, system, ){
			this.node = node;
			this.system = system;
		}
		  
		public name : string; 
		public tempValue : number;
		public calc: string;
		public resultValue : number;
		public resultSuccess:boolean;
		public isValid : boolean;
		public mappedOrigins:originRowData[] = [];

		private validateName( name , node:GrobDerivedNode , messageHandler: StaticMessageHandler | null = null , output:boolean ){
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
		private validateOrigins(  mappedOrigins:originRowData[], calc:string ,  system:TTRPGSystem , messageHandler: StaticMessageHandler | null = null , output:boolean    ){
			let out = (key,msg,error) => { if(output){ messageHandler?.addMessageManual(key,msg,error) }}

			// validate that all inCalc are finished
			let isValid = true ;  
			mappedOrigins.forEach( obj => {
				if (obj.inCalc && !(obj.target)){
					out(obj.key + "1", `Cannot save until all dependencies used in the calc is defined \n ${obj.key} Had no target` , 'error');
					isValid = false;
				}else{
					messageHandler?.removeError(obj.key + "1");
				}
				console.log(obj)
			})
			if (!isValid){
				return false;
			}
			  
			// Set Calc and dependencies 
			let NMap = mappedOrigins.filter( p => calc.contains(p.key) ); 
			NMap.forEach( o => {	
				
				// check if it has segments
				if (!o.segments){ 
					out( o.key, `Contents of ${o.key}'s segments was Null!'`, 'error');
					isValid = false;
					return;
				}
				
				// check that it can create the propper target. AKA target exists in the system. not just empty obj-
				let dep = system.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
				if (!dep ){
					out( o.key, `Target of ${o.key} location ${o.segments[0] +'.'+ o.segments[1] +'.'+ o.segments[2] } was invalid!'`, 'error');
					isValid = false;
					return;
				}

				messageHandler?.removeError( o.key );

			}); 

			return isValid;
		}
		private validateCalculation( calc:string , mappedOrigins:originRowData[] , messageHandler: StaticMessageHandler | null = null , output :boolean  ){
			let out = (key,msg,error) => { if(output){ messageHandler?.addMessageManual(key,msg,error) }}

			// first test the calculation.
			let o = {};
			let mappedKeys : string[] = [];
			mappedOrigins.forEach( p => { o[p.key]= p.testValue ; mappedKeys.push(p.key) } );
			let calcres = GrobDerivedNode.testCalculate( calc , o );
			
			let succes= calcres.success;
			let value = calcres.value;
			
 
			// if there is an calc error shown remove it. . Also messagehandler has to be initialized
			if ( !succes ){ 
				out( 'calc' , `Calculation is invalid, meaning it could not parse`, 'error' );
			} else{
				messageHandler?.removeError('calc');
			}


			this.resultValue = value;
			this.resultSuccess = succes;
			return succes as boolean;
		}
		private validateCalculationOrigins( calc:string , mappedOrigins:originRowData[],  messageHandler: StaticMessageHandler | null = null , output :boolean ){
			let out = (key,msg,error) => { if(output){ messageHandler?.addMessageManual(key,msg,error) }}

			let symbols = GrobDerivedNode.staticParseCalculationToOrigins(calc);
			mappedOrigins.forEach( o  => {
				symbols.remove( o.key ); 
				messageHandler?.removeError( o.key + 'missing' )
			});

			let isValid = true;
			symbols.forEach( s  => {
				isValid = false;
				out( s + 'missing' , `symbol ${s} was missing from origins ` , 'error' )
			});

			return isValid;
		} 
		private _checkIsValid(  output = true  ){
			console.log('_checkIsValid') 
			if(!this.node || !this.system){ 
				return false;
			}

			let isValid = true;


			// Check name is valid 
			isValid = isValid && this.validateName		( this.name ?? '',  this.node , this.messageHandler , output );

			// check that nothing is individually wrong with the origins. 
			isValid = isValid && this.validateOrigins	( this.mappedOrigins , this.calc , this.system ,  this.messageHandler ,output  );

			// Check that all calc origins are present.
			isValid = isValid && this.validateCalculationOrigins( this.calc , this.mappedOrigins , this.messageHandler ,output );

			// check that calculation can be calculated 
			isValid = isValid && this.validateCalculation( this.calc , this.mappedOrigins ,  this.messageHandler ,output );
 
			return isValid;

		}
		public checkIsValid( output = true ){ 
			console.log('checkIsValid') 
			if (output){
				this.messageHandler?.removeAllMessages();
			}
			this.isValid = this._checkIsValid( output ); 
		}  

		public saveNodeChanges( ){
			
			console.log('saveNodeChanges') 
			this.checkIsValid();
			if (!this.isValid){
				return;
			}


			let success = true;

			// if the controller deps arent existing, return false; 
			if(!this.node || !this.system){ 
				return false;
			}

			try{
				// save Name;
				this.node.setName(this.name)

				// save Temp Value;
				this.node.setValue(this.tempValue)

				// save calc
				this.node.setCalc(this.calc);

				// save Origins.  ( in calculation ) 
				let NMap = this.mappedOrigins.filter( p => p.inCalc ); 
				NMap.forEach( o => {
					// @ts-ignore
					let dep = this.system.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
					// @ts-ignore
					this.node.setOrigin( o.key , dep , o.testValue ?? 0 );
				}); 


			}catch(e){
				success = false;
				let err =  new Error('Exception while trying to save Node in UI' );
				err.stack += e.stack;
				throw err;
			}

			// User information
			if (success){
				this.messageHandler?.addMessageManual('save','Saved Node', 'good');
			}else{
				this.messageHandler?.addMessageManual('save','Exception while trying to save Node in UI', 'error');
			}

		}

		public onKeyExchange( e ){
			console.log('onKeyExchange') 
			const s0 = e.detail.old;
			const s1 = e.detail.new; 
			let t0 : originRowData | undefined = this.mappedOrigins.find( p => p.key == s0 );
			if (!t0)
				return;

			let t1 : originRowData | undefined = this.mappedOrigins.find( p => p.key == s1 );
			if (!t1)
				return;

			// we eval if s0 is in the calc. then we need to exchange then delete. 
			t0.key = s1;
			t0.inCalc = this.calc.contains(s1);
			t1.key = s0;
			t1.inCalc = this.calc.contains(s0);
			return 
		}
		public onKeyDelete( e ){
			console.log('onKeyDelete') 
			const key = e.detail;
			let old : originRowData | undefined = this.mappedOrigins.find( p => p.key == key );
			
			if (!old)
				return;

			if (!old.active || !old.inCalc){
				this.mappedOrigins.remove(old);
			} else {
				old.active = false;
				old.segments = new Array(3).fill(null);
			}
		}
		public recalculateCalcAndOrigins(){
			console.log('recalculateCalcAndOrigins') 
			/// Handle Calculation
			let o = {}; 
			this.mappedOrigins.forEach( p => { o[p.key]= p.testValue; } );
			let res = GrobDerivedNode.testCalculate( this.calc , o );

			// save and proccess values 
			this.resultValue	= res.value;
			this.resultSuccess	= res.success;

			/// Handle Add Origins. 
			// calculate the symbols
			let symbols = GrobDerivedNode.staticParseCalculationToOrigins( this.calc );
  
			//remove keys that already exists from the array. and leave a pure toAdd list.
			this.mappedOrigins.forEach( d => {
				let inCalc = symbols.contains(d.key);
				if ( inCalc ){
					symbols.remove(d.key);
				}
				else {
					// in case an item is no longer in the calc, mark it as such. 
					d.inCalc = false;
				}
			})
 
			// for each remaining, add it. 
			symbols.forEach( s => {
				this.mappedOrigins.push({key:s , segments:new Array(3).fill(null) , active:false , testValue: 1, inCalc:true, target : null })
			})
		}
	}

</script> 
<script lang="ts"> 
    import { GrobDerivedNode, TTRPGSystem, type GrobNodeType } from "../../../../Designer";
    import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import './ItemDesigner.scss' 
    import type { Writable } from 'svelte/store'; 
	import OriginRow from "./views/OriginRow.svelte";
    import { slide } from 'svelte/transition';
    import { flip } from 'svelte/animate'; 
    import { on } from "events";
    import { onMount } from "svelte";

	export let node : Writable<GrobDerivedNode|null>;
	export let system : Writable<TTRPGSystem|null>; 
	let messageHandler: StaticMessageHandler; 

	let controller : DerivedItemController = new DerivedItemController();
	$: controller.setControllerDeps($node,$system)
	$: controller.messageHandler = messageHandler;
	$: availableSymbols = controller.mappedOrigins.filter(p => !p.active ).map( p => p.key );
	let flash = false;	

	

	function onNameInput ( event : any  ){  
		messageHandler?.removeError('save');
		let name = event.target.value;
		controller.name = name;
		controller.checkIsValid(false);
		controller.isValid = controller.isValid;
	}

	function onCalcInput ( event : any  ){
		
		let calc = event.target.value; 
		controller.calc = calc;
		messageHandler?.removeError('save');
		controller.recalculateCalcAndOrigins(); 
		controller.mappedOrigins = controller.mappedOrigins;
		controller.checkIsValid(false);
		controller.isValid = controller.isValid;
	}

	function onDeleteClicked(e){
		messageHandler?.removeError('save');
		controller.onKeyDelete(e);
		controller.mappedOrigins = controller.mappedOrigins;
		controller.checkIsValid(false);
		controller.isValid = controller.isValid;
	}
	function onKeyExchange(e){
		messageHandler?.removeError('save');
		controller.onKeyExchange(e);
		controller.mappedOrigins = controller.mappedOrigins;
		controller.checkIsValid(false);
		controller.isValid = controller.isValid;
	}

	function onSave(){
		messageHandler?.removeError('save');
		controller.saveNodeChanges();
		controller.isValid = controller.isValid;
		controller.checkIsValid(false);
		controller.isValid = controller.isValid;
	}

	node.subscribe(p => {

		controller.setControllerDeps( p , $system );

		// flash as update
		flash = true;
		setTimeout( () => { flash = false} , 200) 
	})	

	onMount(() => {
			// set Values 
			controller.name 		= $node?.getName() ?? '';
			controller.tempValue	= $node?.getValue() ?? 0;
			controller.calc			= $node?.calc ?? '@a';
	
			controller.recalculateCalcAndOrigins()
			controller.checkIsValid();
	})

</script>
<div class="GrobsInteractiveColoredBorder" data-state={ flash ? 'flash' : controller.isValid ? 'good' : 'error' } data-state-text={'hej hans'}>
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
		<input type="text" class="ItemDesignerInput" on:input={ ( e ) => { onNameInput(e) } } contenteditable bind:value={controller.name}/>
 
		<div>Node Location</div>
		<div class="ItemDesignerInput" >{ ($node?.parent?.parent?.name ?? 'unknown collection') + '.' +( $node?.parent?.name ?? 'unknown collection') + '.' + $node?.name}</div>
 
	</div>
	<div>
		{#if $node && $system }
			<div class="OriginEditor">
				<div class="derivedCalcStatementRow" data-succes={controller.resultSuccess} >
					<div>Calc</div>
					<input type="text" value={controller.calc} 
						on:input={ onCalcInput }
						placeholder="insert calcStatement here"
					/>
					<div class="derivedCalcStatementResult" data-succes={controller.resultSuccess} >{controller.resultValue}</div>
				</div>
				<div class="derivedOriginRowsContainer">
					{#each controller.mappedOrigins as origin (origin.key) }
						<div animate:flip transition:slide|local class="derivedOriginRowContainer"> 
							<OriginRow 
								bind:rowData 	 = { origin }
								availableSymbols = { availableSymbols }
								system 			 = { $system }
								on:onDelete 		= { onDeleteClicked }
								on:onSymbolSelected = { onKeyExchange }
								on:foundTargetNode = { (e) =>{ controller.checkIsValid(false) }}
							/>   
						</div>
					{/each}
				</div> 
			</div>
		{/if}
	</div> 
	<br>
	<div class="ItemDesignerButtonRow">
		<button on:click={ onSave }  >save changes</button> 
	</div>
</div>