//import { GrobJDerivedNode, TTRPGSystemJSONFormatting, type  GrobJNodeType } 
import { GrobJDerivedNode, TTRPGSystemJSONFormatting, type  GrobJNodeType }  from '../../../../../../src/Modules/graphDesigner';
import { writable, type Writable, get } from 'svelte/store';  
 
type StaticMessageHandler = any
export type originRowData = {key: string, segments:(string|null)[] , active :boolean , testValue :number, inCalc:boolean, target: GrobJNodeType  | null , isSelectAllTarget:boolean };
export const selAllInCollectionString = '- - Select all - -';
export class DerivedCollectionController {
	 
	public system:TTRPGSystemJSONFormatting | null	= null ;
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
		console.log(name);

		// check the name
		if (name== ''){
			isValid = false;
			out('name','The name cannot be empty', 'error')
		}
		else if (name.includes('.')){
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

		
		let symbolsCalc = GrobJDerivedNode.staticParseCalculationToOrigins( calc 	); 
		let symbolsName = GrobJDerivedNode.staticParseCalculationToOrigins( nameCalc ) 
		symbolsName = symbolsName.filter( p => symbolsCalc.includes(p) );

		let symbolsMissing = symbolsCalc.filter( p => !nameCalc.includes(p))
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
	private validateOrigins(  mappedOrigins:originRowData[], calc:string ,  system:TTRPGSystemJSONFormatting , messageHandler: StaticMessageHandler | null = null , output:boolean    ){
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
		let NMap = mappedOrigins.filter( p => calc.includes(p.key) ); 
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
			const index = symbols.indexOf( o.key );
			if (index !== -1) {
				symbols.splice(index, 1);
			} 
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
				type resDataPoint = {name:string, deps:Record<string,GrobJNodeType> }

				// Attempt Save
				let colName = get(this.name);
				this.system?.createDerivedCollection(colName);
				
				// Generate Nodes To Save and Save them.
				let nodesToCreate : resDataPoint[] = this.generateNamePreview() ?? [];
				nodesToCreate.forEach( node => {

					// Create
					let createdNode = this.system?.createDerivedNode( colName , node.name ) as GrobJDerivedNode;
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
			t0.inCalc = get(this.calc).includes(s1);
			t1.key = s0;
			t1.inCalc = get(this.calc).includes(s0);
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
				let inCalc = symbols.includes(d.key);
				if ( inCalc ){
					symbols = symbols.filter( p => p != d.key);
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

			type resDataPoint = {name:string, deps: Record<string,GrobJNodeType>  }
			type result = { data : resDataPoint[] }
			let res : result = { data : [] };
			function recursiveNameFinder( self, nameCalc : string, index : number = 0 ,arr : originRowData[] , res : result , deps : Record<string,GrobJNodeType> ){
				 
				// ge values, and copy nameCalc by value (not reference). 
				let currentName = nameCalc;
				let nodes:GrobJNodeType[];
				let curr = arr[index];

				// if we are done, return result
				if (!curr){ 
					if ( res.data.findIndex( p => p.name == currentName ) != -1 ){ 
						throw new Error('Double Name, in names generated Detected');
					}
					res.data.push( {name:currentName, deps:deps } );
					return;
				}

				// if this is a Select All Segment then get
				if (curr.segments[2] == selAllInCollectionString){
					const sys = (self.system as TTRPGSystemJSONFormatting);  
					let collection = sys.getCollection((curr.segments[0] as any),(curr.segments[1] as any));
					let n : GrobJNodeType[] = collection?.getNodes() ?? [];
					nodes = n;
				}

				// else just add this name to the arr
				else {
					const sys = (self.system as TTRPGSystemJSONFormatting);  
					let collection = sys.getCollection((curr.segments[0] as any),(curr.segments[1] as any));
					let n : GrobJNodeType | undefined = collection?.getNode(curr.segments[2]);
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

			recursiveNameFinder( this , nameCalc ,0, origins, res , {} );  
			this.generativeNameListData.set( res.data.map( p => p.name ) );	
			return res.data;
		}
		catch(e){
			return null;
		}
	}
}  
