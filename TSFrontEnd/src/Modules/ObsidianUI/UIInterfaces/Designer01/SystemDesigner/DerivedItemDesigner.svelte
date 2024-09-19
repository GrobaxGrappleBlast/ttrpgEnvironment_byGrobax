<script context="module"  lang="ts">

	type originRowData = {key: string, segments:(string|null)[] , active :boolean , testValue :number, inCalc:boolean, target: GrobJNodeType | null , isSelectAllTarget: boolean };
	export class DerivedItemController{
		
		public node:GrobJDerivedNode | null	= null ;
		public system:TTRPGSystemJSONFormatting | null	= null ;
		public messageHandler: StaticMessageHandler | null;

		public name 		: Writable<string>	= writable(''); 
		public tempValue	: Writable<number>	= writable(1); 
		public calc			: Writable<string>	= writable(''); 
		public resultValue	: Writable<number>	= writable(0); 
		public resultSuccess: Writable<boolean>	= writable(true); 
		public isValid		: Writable<boolean>	= writable(true); 
		public mappedOrigins: Writable<originRowData[]> = writable([]);

		public setControllerDeps( node, system, ){
			this.node = node;
			this.system = system;

			this.name 			.set(this.node?.name	?? '')
			this.calc 			.set(this.node?.calc	?? '')
			this.tempValue 		.set(0)
			this.resultSuccess 	.set(true)
			this.resultValue 	.set(0)
			this.isValid 		.set(true)
			
			let m = this.node?.origins.map( p => {return {key:p.symbol, segments:p.originKey.split('.'), active: get(this.calc).contains(p.symbol), testValue: p.standardValue , inCalc: get(this.calc).contains(p.symbol) , target: p.origin , isSelectAllTarget : true }})
			this.mappedOrigins.set( m ?? []);
		}
		  

		private validateName( name , node:GrobJDerivedNode , messageHandler: StaticMessageHandler | null = null , output:boolean ){
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
		private validateOrigins(  mappedOrigins:originRowData[], calc:string ,  system:TTRPGSystemJSONFormatting , messageHandler: StaticMessageHandler | null = null , output:boolean    ){
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
			let calcres = GrobJDerivedNode.testCalculate( calc , o );
			
			let succes= calcres.success;
			let value = calcres.value;
			
 
			// if there is an calc error shown remove it. . Also messagehandler has to be initialized
			if ( !succes ){ 
				out( 'calc' , `Calculation is invalid, meaning it could not parse`, 'error' );
			} else{
				messageHandler?.removeError('calc');
			}


			this.resultValue 	.set(value);
			this.resultSuccess 	.set(succes);
			return succes as boolean;
		}
		private validateCalculationOrigins( calc:string , mappedOrigins:originRowData[],  messageHandler: StaticMessageHandler | null = null , output :boolean ){
			let out = (key,msg,error) => { if(output){ messageHandler?.addMessageManual(key,msg,error) }}

			let symbols = GrobJDerivedNode.staticParseCalculationToOrigins(calc);
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
			if(!this.node || !this.system){ 
				return false;
			}

			let isValid = true;


			// Check name is valid 
			isValid = isValid && this.validateName		( get(this.name) ?? '',  this.node , this.messageHandler , output );

			// check that nothing is individually wrong with the origins. 
			isValid = isValid && this.validateOrigins	( get(this.mappedOrigins) , get(this.calc) , this.system ,  this.messageHandler ,output  );

			// Check that all calc origins are present.
			isValid = isValid && this.validateCalculationOrigins( get(this.calc) , get(this.mappedOrigins) , this.messageHandler ,output );

			// check that calculation can be calculated 
			isValid = isValid && this.validateCalculation( get(this.calc ), get(this.mappedOrigins) ,  this.messageHandler ,output );
 
			return isValid;

		}
		public checkIsValid( output = true ){  
			if (output){
				this.messageHandler?.removeAllMessages();
			}
			let valid = this._checkIsValid( output ); 
			this.isValid.set( valid ); 
			return valid;
		}  

		public saveNodeChanges( ){
 
			let success = this.checkIsValid();
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

				// save calc
				this.node.setCalc(get(this.calc));
 
				// save Origins.  ( in calculation ) 
				let NMap = get(this.mappedOrigins).filter( p => p.inCalc ); 
				NMap.forEach( o => {
					// @ts-ignore
					let dep = this.system.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
					// @ts-ignore
					this.node.setOrigin( o.key , dep , o.testValue ?? 0 );
				});  
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

			this.mappedOrigins.update( mappedOrigins => {
				const s0 = e.detail.old;
				const s1 = e.detail.new; 
				let t0 : originRowData | undefined = mappedOrigins.find( p => p.key == s0 );
				if (!t0)
					return mappedOrigins;

				let t1 : originRowData | undefined = mappedOrigins.find( p => p.key == s1 );
				if (!t1)
					return mappedOrigins;

				// we eval if s0 is in the calc. then we need to exchange then delete. 
				t0.key = s1;
				t0.inCalc = get(this.calc).contains(s1);
				t1.key = s0;
				t1.inCalc = get(this.calc).contains(s0);
				return mappedOrigins;
			})
			return 
		}
		public onKeyDelete( e ){ 
			this.mappedOrigins.update( mappedOrigins => {
				const key = e.detail;
				let old : originRowData | undefined = mappedOrigins.find( p => p.key == key );
				
				if (!old)
					return mappedOrigins;

				if (!old.active || !old.inCalc){
					mappedOrigins.remove(old);
				} else {
					old.active = false;
					old.segments = new Array(3).fill(null);
				}
				return mappedOrigins;
			})
		}
		public recalculateCalcAndOrigins(){ 
			/// Handle Calculation
			let o = {}; 
			get(this.mappedOrigins).forEach( p => { o[p.key]= p.testValue; } );
			let calc = get(this.calc) ; 
			let res = GrobJDerivedNode.testCalculate( calc , o );

			// save and proccess values 
			this.resultValue	.set(res.value);
			this.resultSuccess	.set(res.success);

			/// Handle Add Origins. 
			// calculate the symbols
			let symbols = GrobJDerivedNode.staticParseCalculationToOrigins( calc );
  
			//remove keys that already exists from the array. and leave a pure toAdd list.
			this.mappedOrigins.update( mappedOrigins =>{
 
				mappedOrigins.forEach( d => {
					let inCalc = symbols.contains(d.key);
					if ( inCalc ){
						symbols.remove(d.key);
						d.inCalc = true;
					}
					else {
						// in case an item is no longer in the calc, mark it as such. 
						d.inCalc = false;
					}
				})
				

				// for each remaining, add it. 
				symbols.forEach( s => {
					mappedOrigins.push({key:s , segments:new Array(3).fill(null) , active:false , testValue: 1, inCalc:true, target : null , isSelectAllTarget : true  })
				})  
				return mappedOrigins;
			})
		}
	}

</script> 
<script lang="ts"> 
    import { GrobJDerivedNode,TTRPGSystemJSONFormatting, type GrobJNodeType } from "../../../../Designer/index";
    import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import './ItemDesigner.scss' 
    import { writable, type Writable, get } from 'svelte/store'; 
	import OriginRow from "./views/OriginRow.svelte";
    import { slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';  
    import { createEventDispatcher , onMount } from "svelte";

	export let node : Writable<GrobJDerivedNode|null>;
	export let system : Writable<TTRPGSystemJSONFormatting|null>; 
	let secondSlideInReady = false;
	export let goodTitle = "No Error";
	export let badTitle = "Error"

	let messageHandler: StaticMessageHandler; 
	const dispatch = createEventDispatcher(); 
	
	let controller : DerivedItemController = new DerivedItemController();
	$: controller.setControllerDeps($node,$system)
	$: controller.messageHandler = messageHandler;
	$: availableSymbols = get(controller.mappedOrigins).filter(p => !p.active ).map( p => p.key );
	let flash = false;	
	
	

	let controllerMappedOrigin	: Writable<originRowData[]>;
	let controllerResultValue	: Writable<number>;
	let controllerResultSucces	: Writable<boolean>;
	let controllerName			: Writable<string>;
	let controllerCalc			: Writable<string>;
	let controllerIsValid		: Writable<boolean>;

	// save original Name
	let origName : string ; 

	function onNameInput ( event : any  ){  
		messageHandler?.removeError('save');
		let name = event.target.value;
		controller.name.set( name);
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
		if (controller.saveNodeChanges()){
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
		controller.recalculateCalcAndOrigins()
		controller.checkIsValid(); 
		controllerMappedOrigin	= controller.mappedOrigins;
		controllerResultValue	= controller.resultValue;
		controllerResultSucces	= controller.resultSuccess;
		controllerName			= controller.name;
		controllerCalc			= controller.calc;
		controllerIsValid		= controller.isValid;
		origName = get(controller.name);
 
	})

</script>

<div 
	class="GrobsInteractiveColoredBorder" 
	data-state={ flash ? 'flash' : $controllerIsValid ? 'good' : 'error' } 
	data-state-text={ $controllerIsValid ? goodTitle: badTitle}
	
>
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
		<input type="text" class="ItemDesignerInput" on:input={ ( e ) => { onNameInput(e) } } contenteditable bind:value={ $controllerName }/>
 
		<div>Node Location</div>
		<div class="ItemDesignerInput" >{ ($node?.parent?.parent?.name ?? 'unknown collection') + '.' +( $node?.parent?.name ?? 'unknown collection') + '.' + $controllerName }</div>
 
	</div>
	<div>
		{#if $node && $system }
			<div class="OriginEditor">
				<div class="derivedCalcStatementRow" data-succes={ $controllerResultSucces } >
					<div>Calc</div>
					<input type="text" value={ $controllerCalc } 
						on:input={ onCalcInput }
						placeholder="insert calcStatement here"
					/>
					<div class="derivedCalcStatementResult" data-succes={ $controllerResultSucces } >{ $controllerResultValue }</div>
				</div>
				<div class="derivedOriginRowsContainer" >
					{#if $controllerMappedOrigin }
						<div transition:slide={{delay:500}}>
							{#each $controllerMappedOrigin as origin (origin.key) }
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
					{/if}
				</div> 
			</div>
		{/if}
	</div> 
	<br>
	<div class="ItemDesignerButtonRow">
		<button on:click={ onSave }  >save changes</button> 
	</div>
</div>
 