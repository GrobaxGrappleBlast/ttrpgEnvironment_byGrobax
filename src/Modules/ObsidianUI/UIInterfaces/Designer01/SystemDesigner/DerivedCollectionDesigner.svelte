<script context="module"  lang="ts">
	import ToogleSection from './../BaseComponents/ToogleSection/ToogleSection.svelte';

	type originRowData = {key: string, segments:(string|null)[] , active :boolean , testValue :number, inCalc:boolean, target: GrobNodeType  | null , isSelectAllTarget:boolean };
	const selAllInCollectionString = '- - Select all - -';
	export class DerivedCollectionController {
		 
		public system:TTRPGSystem | null	= null ;
		public messageHandler: StaticMessageHandler | null;

		public name 		: Writable<string>			= writable(''); 
		public nameCalc		: Writable<string>			= writable(''); 
		public tempValue	: Writable<number>			= writable(1); 
		public calc			: Writable<string>			= writable(''); 
		public resultValue	: Writable<number>			= writable(0); 
		public resultSuccess: Writable<boolean>			= writable(true); 
		public resultNameValue	: Writable<string>		= writable(''); 
		public resultNameSuccess: Writable<boolean>		= writable(true); 
		public isValid		: Writable<boolean>			= writable(true); 
		public mappedOrigins: Writable<originRowData[]> = writable([]);
 
		public generativeNameListData : Writable<string[]>	= writable([]); 

		public setControllerDeps( system, ){ 
			this.system = system;

			this.name 			.set( '')
			this.nameCalc		.set( '')
			this.calc 			.set( '') 
			this.tempValue 		.set(0)
			this.resultSuccess 	.set(true)
			this.resultValue 	.set(0)
			this.resultNameSuccess 	.set(true)
			this.resultNameValue 	.set('') 
			this.isValid 		.set(true)
			 
			this.mappedOrigins.set( []);
			  
		}
		  
		private validateName( name , messageHandler: StaticMessageHandler | null = null , output:boolean ){
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
			else if ( this.system?.hasCollection('derived',name )  || this.system?.hasCollection('fixed',name )  ){
				isValid = false;
				out('name','The Collection name is already in use ', 'error')
			}
			else{
				messageHandler?.removeError('name');
			}
			return isValid;
		} 
		private validateItemName( nameCalc , calc , originData : originRowData[] ,  messageHandler: StaticMessageHandler | null = null , output:boolean ){
		 
			let out = (key,msg,error) => { if(output){ messageHandler?.addMessageManual(key,msg,error) }}

			
			let symbolsCalc = GrobDerivedNode.staticParseCalculationToOrigins( calc 	); 
			let symbolsName = GrobDerivedNode.staticParseCalculationToOrigins( nameCalc ) 
			symbolsName = symbolsName.filter( p => symbolsCalc.includes(p) );

			let symbolsMissing = symbolsCalc.filter( p => !nameCalc.contains(p))
			let isValid = true;

			if (symbolsMissing.length != 0){
				symbolsMissing.forEach(s => {

					let isAllSetting = originData.findIndex( p => p.isSelectAllTarget && p.key == s ) != -1;
					if (isAllSetting){
						out('NoSymbolName' + s, s + " was missing from name calculation \nAll Select All Settings must be in the name ",'error') 
						isValid = false;
					}
				})
			}
			
			let nameRES = nameCalc;
			symbolsName.forEach(s => {
				nameRES = nameRES.replace( s , '['+s+']');
			});

			this.resultNameSuccess.set(isValid);
			this.resultNameValue.set(nameRES);
			 
			return isValid;
		} 
		private validateOrigins(  mappedOrigins:originRowData[], calc:string ,  system:TTRPGSystem , messageHandler: StaticMessageHandler | null = null , output:boolean    ){
			let out = (key,msg,error) => { if(output){ messageHandler?.addMessageManual(key,msg,error) }}

			// validate that all inCalc are finished
			let isValid = true ;  
			mappedOrigins.forEach( obj => {
				if (obj.inCalc && !(obj.target) && !obj.isSelectAllTarget ){
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
				if( !o.isSelectAllTarget ){
					let dep = system.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
					if (!dep ){
						out( o.key, `Target of ${o.key} location ${o.segments[0] +'.'+ o.segments[1] +'.'+ o.segments[2] } was invalid!'`, 'error');
						isValid = false;
						return;
					}
				}
			
			
				messageHandler?.removeError( o.key );
			}); 

			return isValid;
		}
		private validateCalculation( calc:string , mappedOrigins:originRowData[] , messageHandler: StaticMessageHandler | null = null , output :boolean  ){
			let out = (key,msg,error) => { if(output){ messageHandler?.addMessageManual(key,msg,error) }}

			if(calc.trim() == ''){
				out( 'calc' , `Calculation cannot be empty`, 'error' );
				return false;
			}



			if(calc.trim() == ''){
				out( 'calc' , `Calculation cannot be empty`, 'error' );
				return false;
			}



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


			this.resultValue 	.set(value);
			this.resultSuccess 	.set(succes);
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
			if( !this.system){ 
				return false;
			}

			let isValid = true; 

			// Check name is valid 
			isValid = isValid && this.validateName		( get(this.name) ?? '' , this.messageHandler , output );

			// check that nothing is individually wrong with the origins. 
			isValid = isValid && this.validateOrigins	( get(this.mappedOrigins) , get(this.calc) , this.system ,  this.messageHandler ,output  );
 
			isValid = isValid && this.validateCalculationOrigins( get(this.calc) , get(this.mappedOrigins) , this.messageHandler , output );
 
			// Check that all calc origins are present.
			let d = this.validateItemName( get(this.nameCalc), get(this.calc)  , get(this.mappedOrigins)  , this.messageHandler ,output );
			isValid = isValid && d;
 
			// check that calculation can be calculated 
			isValid = isValid && this.validateCalculation( get(this.calc ), get(this.mappedOrigins) ,  this.messageHandler ,output );
 
			return isValid;

		}
		public checkIsValid( output = true ){  
			
			this.messageHandler?.removeAllMessages();
			
			let valid = this._checkIsValid( output ); 
			this.isValid.set( valid ); 
			return valid;
		}  
 
		public saveCollection( ){
			
			let success = this.checkIsValid( true );
			if (!success){
				this.messageHandler?.addMessageManual('save','Was Not valid, so could not save', 'error');
				return false ;
			}
			else {
				try {
					// type declaration
					type resDataPoint = {name:string, deps:Record<string,GrobNodeType> }

					// Attempt Save
					let colName = get(this.name);
					this.system?.createDerivedCollection(colName);
					
					// Generate Nodes To Save and Save them.
					let nodesToCreate : resDataPoint[] = this.generateNamePreview() ?? [];
					nodesToCreate.forEach( node => {

						// Create
						let createdNode = this.system?.createDerivedNode( colName , node.name );
						let calc = get(this.calc);
						createdNode?.setCalc(calc);

						// Add Dependency
						if (createdNode) {
							Object.keys(node.deps).forEach( key => { 
								let dep = node.deps[key];
								createdNode.setOrigin(key,dep,0)
							});
						}
					});
				} catch (e){
					success = false;
				}
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
			let res = GrobDerivedNode.testCalculate( calc , o );

			// save and proccess values 
			this.resultValue	.set(res.value);
			this.resultSuccess	.set(res.success);

			/// Handle Add Origins. 
			// calculate the symbols
			let symbols = GrobDerivedNode.staticParseCalculationToOrigins( calc );
  
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
					mappedOrigins.push({key:s , segments:new Array(3).fill(null) , active:false , testValue: 1, inCalc:true, target : null , isSelectAllTarget : false })
				})  
				return mappedOrigins;
			})
		}
 
		public generateNamePreview(){
			  
			if ( !this.system ){
				this.generativeNameListData.set([])
				return;
			}
			try {

				let origins = get(this.mappedOrigins);
				let nameCalc = get(this.nameCalc);			
				let filtered = origins.filter( p => { return nameCalc.contains(p.key) && p.isSelectAllTarget } )

				type resDataPoint = {name:string, deps: Record<string,GrobNodeType>  }
				type result = { data : resDataPoint[] }
				let res : result = { data : [] };
				function recursiveNameFinder( self, nameCalc : string, index : number = 0 ,arr : originRowData[] , res : result , deps : Record<string,GrobNodeType> ){
					 
					// ge values, and copy nameCalc by value (not reference). 
					let currentName = nameCalc;
					let nodes:GrobNodeType[];
					let curr = arr[index];

					// if we are done, return result
					if (!curr){ 
						if ( res.data.findIndex( p => p.name == currentName ) != -1 ){ 
							throw new Error('Double Name, in names generated Detected');
						}
						//todo: fix this
						res.data.push( {name:currentName, deps:deps } );
						return;
					}

					// if this is a Select All Segment then get
					if (curr.segments[2] == selAllInCollectionString){
						const sys = (self.system as TTRPGSystem);  
						let collection = sys.getCollection((curr.segments[0] as any),(curr.segments[1] as any));
						let n : GrobNodeType[] = collection?.getNodes() ?? [];
						nodes = n;
					}

					// else just add this name to the arr
					else {
						const sys = (self.system as TTRPGSystem);  
						let collection = sys.getCollection((curr.segments[0] as any),(curr.segments[1] as any));
						let n : GrobNodeType | undefined = collection?.getNode(curr.segments[2]);
						nodes = n ? [ n ] : [];
					}
					
					/// replace instring Part. 
					nodes.forEach( node  => {
						let currNameCalc = currentName.replace( curr.key , node.getName() ); 
						let _deps = Object.assign({}, deps );
						_deps[ curr.key ] = node;
						recursiveNameFinder(self,currNameCalc, index + 1 ,arr,res, _deps)
					});
					
				}
				recursiveNameFinder( this , nameCalc ,0, filtered, res , {} );  
				this.generativeNameListData.set( res.data.map( p => p.name ) );	
				return res.data;
			}
			catch(e){
				return null;
			}
		}
	}  

</script> 
<script lang="ts"> 
    import { GrobDerivedNode, TTRPGSystem, type GrobNodeType } from "../../../../Designer";
    import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import './ItemDesigner.scss' 
    import { writable, type Writable, get } from 'svelte/store'; 
	import OriginRow from "./views/OriginRow.svelte";
    import { slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';   
    import { createEventDispatcher, onMount } from "svelte";
    import { DerivedItemController } from "./DerivedItemDesigner.svelte";
	const dispatch = createEventDispatcher();  

	export let system : Writable<TTRPGSystem|null>; 
	export let secondSlideInReady = false;
	export let goodTitle = "No Error";
	export let badTitle = "Error"

	let messageHandler: StaticMessageHandler; 

	let controller : DerivedCollectionController = new DerivedCollectionController(); 
	$: controller.setControllerDeps( $system )
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
		controller.setControllerDeps( $system ); 
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
<div class="GrobsInteractiveColoredBorder" data-state={  $controllerIsValid ? 'good' : 'error' } data-state-text={ $controllerIsValid ? goodTitle: badTitle}>
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

		<div>new Collection Name</div>
		<input type="text" class="ItemDesignerInput" on:input={ ( e ) => { onNameInput(e) } } contenteditable bind:value={ $controllerName }/>  
	</div>
	<div> 
		{#if $system }
			<div class="OriginEditor">
				<div class="derivedCollectionCalcStatementMatrix" >
					 
						<div data-succes={ $controllerNameResultSucces } >Name</div>
						<input type="text"  
							on:input={ onCalcNameInput }
							placeholder="insert Name Calc Statement here"
						/>
						<div class="derivedCalcStatementResult" data-succes={ $controllerNameResultSucces } >{ $controllerNameResultValue }</div>
					 
					 
						<div  data-succes={ $controllerResultSucces } >Calc</div>
						<input type="text" value={ $controllerCalc } 
							on:input={ onCalcInput }
			 				placeholder="insert calcStatement here"
						/>
						<div class="derivedCalcStatementResult" data-succes={ $controllerResultSucces } >{ $controllerResultValue }</div>
					 
					 
				</div>
				<div class="derivedOriginRowsContainer">
					{#if $controllerMappedOrigin && secondSlideInReady }
						<div transition:slide|local >
							{#each $controllerMappedOrigin as origin (origin.key) }
								<div transition:slide|local class="derivedOriginRowContainer"> 
									<OriginRow 
										bind:rowData 	 = { origin }
										availableSymbols = { availableSymbols }
										system 			 = { $system }
										on:onDelete 		= { onDeleteClicked }
										on:onSymbolSelected = { onKeyExchange }
										on:foundTargetNode = { (e) =>{ controller.checkIsValid(false) }}
										allowSelectAll = { true }
										SelectAllText = { selAllInCollectionString }
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
	 