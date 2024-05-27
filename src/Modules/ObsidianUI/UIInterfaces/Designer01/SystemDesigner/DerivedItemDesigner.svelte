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

		private validateName( name , node:GrobDerivedNode , messageHandler: StaticMessageHandler | null = null ){
			
			let isValid = true ; 
			// check the name
			if (name.contains('.')){
				isValid = false;
				messageHandler?.addMessageManual('2','The name cannot contain "."', 'error')
			}
			else if ( node.parent.hasNode( name ) && name != node.getName() ){
				isValid = false;
				messageHandler?.addMessageManual('2','The name is already in use, in the same collection', 'error')
			}else{
				messageHandler?.removeError('2');
			}
			return isValid;
		} 
		private validateOrigins(  mappedOrigins:originRowData[], calc:string ,  system:TTRPGSystem , messageHandler: StaticMessageHandler | null = null    ){

			// validate that all inCalc are finished
			let isValid = true ;  
			mappedOrigins.forEach( o => {
				if (o.inCalc && !(o.target)){
					messageHandler?.addMessageManual(o.key, `Cannot save until all dependencies used in the calc is defined \n ${o.key} Had no target` , 'error');
					isValid = false;
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
					messageHandler?.addMessageManual( o.key, `Contents of ${o.key}'s segments was Null!'`, 'error');
					isValid = false;
					return;
				}
				
				// check that it can create the propper target. AKA target exists in the system. not just empty obj-
				let dep = system.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
				if (!dep ){
					messageHandler?.addMessageManual( o.key, `Target of ${o.key} location ${o.segments[0] +'.'+ o.segments[1] +'.'+ o.segments[2] } was invalid!'`, 'error');
					isValid = false;
					return;
				}

			}); 

			return isValid;
		}
		private validateCalculation( calc:string , mappedOrigins:originRowData[] , messageHandler: StaticMessageHandler | null = null  ){
			// first test the calculation.
			let o = {};
			let mappedKeys : string[] = [];
			mappedOrigins.forEach( p => { o[p.key]= p.testValue ; mappedKeys.push(p.key) } );
			let calcres = GrobDerivedNode.testCalculate( calc , o );
			
			let succes= calcres[0];
			let value = calcres[1];
			

			// if there is an calc error shown remove it. . Also messagehandler has to be initialized
			if ( succes ){
				// message handler is not initialized, when quick openned. so skip this if it isent. 
				if ( messageHandler && messageHandler.removeError !== undefined ){
					messageHandler.removeError( 'calc');
				}	 
			}else {
				messageHandler?.addMessageManual( 'calc' , `Calculation is invalid, meaning it could not parse`, 'error' );
			} 


			this.resultValue = value;
			this.resultSuccess = succes;
			return succes as boolean;
		}
		private validateCalculationOrigins( calc:string , mappedOrigins:originRowData[],  messageHandler: StaticMessageHandler | null = null  ){
			let symbols = GrobDerivedNode.staticParseCalculationToOrigins(calc);
			mappedOrigins.forEach( o  => {
				symbols.remove( o.key ); 
			});

			let isValid = true;
			symbols.forEach( s  => {
				isValid = false;
				messageHandler?.addMessageManual( s, `symbol ${s} was missing from origins ` , 'error' )
			});

			return isValid;
		} 
		private _checkIsValid(){
		
			if(!this.node || !this.system){ 
				return false;
			}


			let isValid = true;

			// Check name is valid 
			isValid = isValid && this.validateName		( this.name,  this.node , this.messageHandler );

			// check that nothing is individually wrong with the origins. 
			isValid = isValid && this.validateOrigins	( this.mappedOrigins , this.calc , this.system ,  this.messageHandler );

			// Check that all calc origins are present.
			isValid = isValid && this.validateCalculationOrigins( this.calc , this.mappedOrigins , this.messageHandler  );

			// check that calculation can be calculated 
			isValid = isValid && this.validateCalculation( this.calc , this.mappedOrigins , this.messageHandler );
 
			return isValid;

		}
		public checkIsValid(){ 
			this.isValid = this._checkIsValid(); 
		}  

		public saveNodeChanges( ){
			
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
					node.setOrigin( o.key , dep , o.testValue ?? 0 );
				}); 


			}catch(e){
				let err =  new Error('Exception while trying to save Node in UI' );
				err.stack += e.stack;
				throw err;
			}
		}

		public onKeyDelete()
	}

</script> 
<script lang="ts"> 
    import { GrobDerivedNode, TTRPGSystem, type GrobNodeType } from "../../../../Designer";
    import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import './ItemDesigner.scss'
    import { createEventDispatcher } from "svelte";
    import type { Writable } from 'svelte/store';
    import { FileContext } from '../../../../../../src/Modules/ObsidianUICore/fileContext';
	import { Mutex } from "async-mutex";
	import OriginRow from "./views/OriginRow.svelte";
    import { slide } from 'svelte/transition';
    import { flip } from 'svelte/animate'; 

	export let node : Writable<GrobDerivedNode|null>;
	export let system : Writable<TTRPGSystem|null>; 
	let messageHandler: StaticMessageHandler; 


	/*
		let messageHandler: StaticMessageHandler; 
		let originEditorArray : {msg:string, type:'good'|'error'|'verbose',key:string}[] =[]
		let valid : boolean = true;
		let dispatch = createEventDispatcher();
		let mutex:Mutex = new Mutex();

		let name =  $node?.getName()	?? 'name'; 
		let flash = false;	
		type originRowData = {key: string, segments:(string|null)[] , active :boolean , testValue :number, inCalc:boolean, target: GrobNodeType | null };
		let _mappedOrigins:originRowData[] = []	
		let calc: string;
			$: availableSymbols = _mappedOrigins.filter(p => !p.active ).map( p => p.key );
		let resultValue : any;
		let resultSuccess:boolean;
	*/

	let controller : DerivedItemController = new DerivedItemController();
	$: controller.setControllerDeps($node,$system)
	$: controller.messageHandler = messageHandler;
	$: availableSymbols = controller.mappedOrigins.filter(p => !p.active ).map( p => p.key );
	let flash = false;	

	function onNameInput ( event : any  ){  
		let name = event.target.value;
	}

	function onValueInput ( event : any  ){  
		let name = event.target.value;
	}

	function onOriginInput ( event : any  ){  
		let name = event.target.value;
	}

	function onCalcInput ( event : any  ){  
		let name = event.target.value;
	}

	node.subscribe(p => {

		// initialize all aditor options
		name =  $node?.getName() ?? 'name';
		calc = $node?.calc ?? '';
		_mappedOrigins = [];
		$node?.origins.forEach( ( p ) => {
			let segs = p.originKey?.split('.') ?? null;
			_mappedOrigins.push( {key:p.symbol , segments:segs ,active:true , testValue: 1, inCalc:true, target: p.origin })
		}) 
		_mappedOrigins = _mappedOrigins;
		testCalcValue(calc);

		// flash as update
		flash = true;
		setTimeout( () => { flash = false} , 200)
		
		
	})
	/*
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
		
		let originRes = TEMP_FROM_ORIGINEDITOR();

		if (!originRes){
			originEditorArray.forEach( err => {
				messageHandler.addMessageManual(err.key,err.msg,err.type);
			});
		}else{
			messageHandler.addMessageManual('succes','Saved Node', 'good');
		}


		release();
		
	}
	
	function testCalcValue( calcValue : string ){
		
		// first test the calculation.
		let o = {};
		let mappedKeys : string[] = [];
		_mappedOrigins.forEach( p => { o[p.key]= p.testValue ; mappedKeys.push(p.key) } );
		let calcres = GrobDerivedNode.testCalculate( calcValue , o );
	
		// 	second calculate the symbols
		let symbData = GrobDerivedNode.staticParseCalculationToOrigins( calc );

		// save and proccess values 
		resultValue		= calcres.value;
		resultSuccess	= calcres.success;

		// if there is an calc error shown remove it. . Also messagehandler has to be initialized
		if ( resultSuccess  ){
			// message handler is not initialized, when quick openned. so skip this if it isent. 
			if ( messageHandler && messageHandler.removeError !== undefined ){
				messageHandler.removeError( 'calc');
			}	 
		}

		//Mapp items no longer in the calc for delete ready. And if they arent initialized, just delete them
		_mappedOrigins.forEach( d => {
			
			// set standard value to be overwritten if false
			d.inCalc=true;

			if (!symbData.contains(d.key) ){

				// set incalc // this updates ui with colors and such
				d.inCalc = false;
				
				// if its deleteable delete it. 
				if ( !d.active){
					_mappedOrigins.remove(d);
				}
			}
		})
		// For items not in the list, add them 
		symbData.forEach( s => {
			if ( !mappedKeys.contains(s) ){
				_mappedOrigins.push({key:s , segments:new Array(3).fill(null) , active:false , testValue: 1, inCalc:true, target : null })
			}
		})
		_mappedOrigins = _mappedOrigins;
	}	
 
	function onDelete( e ){
		const s0 = e.detail;
		let old : originRowData | undefined = _mappedOrigins.find( p => p.key == s0 );
		
		if (!old)
			return;

		if (!old.active){
			_mappedOrigins.remove(old);
		} else {
			if ( old.inCalc ){
				old.active = false;
				old.segments = new Array(3).fill(null);
			}else {
				_mappedOrigins.remove(old);
			}
		}
		_mappedOrigins = _mappedOrigins;
	}

	function onSymbolSelected ( e ) {
		const s0 = e.detail.old;
		const s1 = e.detail.new; 
		let t0 : originRowData | undefined = _mappedOrigins.find( p => p.key == s0 );
		if (!t0)
			return;

		let t1 : originRowData | undefined = _mappedOrigins.find( p => p.key == s1 );
		if (!t1)
			return;

		// we eval if s0 is in the calc. then we need to exchange then delete. 
		t0.key = s1;
		t0.inCalc = calc.contains(s1);
		t1.key = s0;
		t1.inCalc = calc.contains(s0);
		_mappedOrigins = _mappedOrigins;
		return 
	}
	*/

	function onDelete( e ){
		const s0 = e.detail;
		let old : originRowData | undefined = _mappedOrigins.find( p => p.key == s0 );
		
		if (!old)
			return;

		if (!old.active){
			controller.mappedOrigins.remove(old);
		} else {
			if ( old.inCalc ){
				old.active = false;
				old.segments = new Array(3).fill(null);
			}else {
				_mappedOrigins.remove(old);
			}
		}
		_mappedOrigins = _mappedOrigins;
	}

	function onSymbolSelected ( e ) {
		const s0 = e.detail.old;
		const s1 = e.detail.new; 
		let t0 : originRowData | undefined = _mappedOrigins.find( p => p.key == s0 );
		if (!t0)
			return;

		let t1 : originRowData | undefined = _mappedOrigins.find( p => p.key == s1 );
		if (!t1)
			return;

		// we eval if s0 is in the calc. then we need to exchange then delete. 
		t0.key = s1;
		t0.inCalc = calc.contains(s1);
		t1.key = s0;
		t1.inCalc = calc.contains(s0);
		_mappedOrigins = _mappedOrigins;
		return 
	}

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
		{#if $node && $system}
			<div class="OriginEditor">
				<div class="derivedCalcStatementRow" data-succes={controller.resultSuccess} >
					<div>Calc</div>
					<input type="text" bind:value={controller.calc} 
						on:input={ (e ) => { onCalcInput(e) }}
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
								on:onDelete = {  onDelete }
								on:onSymbolSelected ={ onSymbolSelected }
							/>   
						</div>
					{/each}
				</div> 
			</div>
		{/if}
	</div> 
	<div class="ItemDesignerButtonRow">
		<button on:click={ save }  >save changes</button> 
	</div>
</div>