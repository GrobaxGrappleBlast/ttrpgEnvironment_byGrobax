
import { get, writable, type Writable } from 'svelte/store';  
import { GrobJDerivedNode, GrobJNodeType } from '../../../../../../../graphDesigner';
import StaticMessageHandler from '../../../../../../Components/Messages/StaticMessageHandler.svelte';
import { GrobDerivedNode, GrobFixedNode, TTRPGSystem } from 'ttrpg-system-graph';
import { AGrobNode } from 'ttrpg-system-graph/dist/Nodes/AGrobNodte';
import { UINode } from '../../../../../../../graphDesigner/UIComposition/UINode';
import { UISystem } from '../../../../../../../graphDesigner/UIComposition/UISystem';
import { forEach } from 'jszip';
 

class AItemController<T extends AGrobNode<T>> {

	public uiNode			: UINode;
	public node				: T ;
	public system			: UISystem ;
	public messageHandler	: StaticMessageHandler | null = null;

	public isValid		: Writable<boolean>	= writable(true); 

	// name and standard value, isvaldi are for all nodes.
	public name 		: Writable<string>	= writable(''); 
	public standardValue: Writable<number>	= writable(1);  
	
	public setControllerDeps( uiNode : UINode, system : UISystem, out : (msg) => any ){
		this.uiNode = uiNode;
		this.node	= uiNode.link as any;
		this.system = system;

		// base for fixed items
		this.isValid 		.set(true) 
		this.name 			.set(this.uiNode?.name	?? '') 
		this.standardValue 	.set(0) 
	} 

	// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	// --- protected validation functions- --- --- protected validation functions- ---
	// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	public validateName( name , out : ( msg ) => any){
		
		let isValid = true; 
		if (name == ''){
			isValid = false;
			out('The name cannot be empty')
		}
		else if (name.includes('.')){
			isValid = false;
			out('The name cannot contain "."')
		}
		else if ( this.uiNode.parent.hasNode( name ) && name != this.uiNode.name ){
			isValid = false;
			out('The name is already in use, in the same collection')
		}
		return isValid;
	}

	// Validation 
	protected _outList : Set<string> = new Set();
	protected _checkIsValid(  output = true ){ 
		
		if(!this.uiNode || !this.system){ 
			return false;
		}
		
		// Create values to start with.
		let isValid = true; 

		// create an out method. based in wether or not to have an output. 
		let _out = output ? (msg) => {this._outList.add(msg)} : (msg) => {};
		
		// validate lien for each validateMethod. 
		isValid = isValid && this.validateName( get(this.name) ?? '' , _out );
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

}

export class FixedItemController	extends AItemController<GrobFixedNode>{


	// Save
	public saveNodeChanges( ){
		let success = this.checkIsValid(true);
		if (!success){
			return false ;
		}
		
		// update all but name;
		this.node.setValue	( get(this.standardValue) );

		// name triggers update 
		this.node.setName	( get(this.name) );

		return true;	
	} 


} 
export type originRowData = {key: string, segments:(string|null)[] , active :boolean , testValue :number, inCalc:boolean, target: GrobJNodeType | null , isSelectAllTarget: boolean };
export type originRowDataMin = {key: string, segments:(string|null)[] , testValue? : number , target? : GrobJNodeType };

/*
export class DerivedItemController	extends AItemController<GrobDerivedNode> {
	
	// calc variables are for derived nodes 
	public calc			: Writable<string>	= writable(''); 
	public resultValue	: Writable<number>	= writable(0); 
	public resultSuccess: Writable<boolean>	= writable(true);
	public mappedOrigins: Writable<originRowData[]> = writable([]); 
 
	public setControllerDeps( node : UINode, system : UISystem , out : (msg) => any ){
		
		super.setControllerDeps(node,system,out);

		// base for derived items 
		this.calc			.set(this.uiNode.link?.calc ?? '');
		this.resultValue	.set(0);		
		this.resultSuccess	.set(true);	
		this.updateMappedOrigins();	
	}  
	public updateMappedOrigins(){
		let m = this.uiNode?.link?.origins?.map( 
			p => {
				return { 
					key:p.symbol,
					segments:p.originKey.split('.'),
					active: get(this.calc).includes(p.symbol),
					testValue: p.standardValue ,
					inCalc: get(this.calc).includes(p.symbol) ,
					target: p.origin ,
					isSelectAllTarget : true 
				}
			}
		) ?? [];	
		this.mappedOrigins	.set(m);	
	}

	// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	// --- protected validation functions- --- --- protected validation functions- ---
	// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	public validateOrigins(  mappedOrigins:originRowData[], calc:string , system : UISystem ,out : (msg) => any ){
		return DerivedItemController.validateOrigins(mappedOrigins,calc,system,out);
	}
	public validateCalculation( calc:string , mappedOrigins:originRowData[] , out : (msg) => any ,resultValue : Writable<number>, resultSuccess: Writable<boolean> ){
		return DerivedItemController.validateCalculation( calc , mappedOrigins , out ,resultValue , resultSuccess )
	}
	public validateCalculationOrigins( calc:string , mappedOrigins:originRowData[] , out : (msg) => any ){
		return DerivedItemController.validateCalculationOrigins(calc, mappedOrigins, out);
	} 
	public static validateOrigins(  mappedOrigins:originRowData[], calc:string ,system : UISystem, out : (msg) => any 			){
			// validate that all inCalc are finished
			let isValid = true ;   
			mappedOrigins.forEach( obj => {
				if (obj.inCalc && !(obj.target)){
					out(`Cannot save until all dependencies used in the calc is defined \n ${obj.key} Had no target \n`);
					isValid = false;
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
					out(`Contents of ${o.key}'s segments was Null!'`);
					isValid = false;
					return false;
				}
				
				// check that it can create the propper target. AKA target exists in the system. not just empty obj-
				let dep = system.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
				if (!dep ){
					out(`Target of ${o.key} location ${o.segments[0] +'.'+ o.segments[1] +'.'+ o.segments[2] } was invalid!'`);
					isValid = false;
					return false;
				}
			}); 
	
			return isValid;
	}
	public static validateCalculation( calc:string , mappedOrigins:originRowData[] , out : (msg) => any , resultValue? : Writable<number>, resultSuccess?: Writable<boolean>,){

		// first test the calculation.
		let o = {};
		let mappedKeys : string[] = [];
		mappedOrigins.forEach( p => { o[p.key]= p.testValue ; mappedKeys.push(p.key) } );
		let calcres = GrobJDerivedNode.testCalculate( calc , o );
		
		let succes= calcres.success;
		let value = calcres.value;

		// if there is an calc error shown remove it. . Also messagehandler has to be initialized
		if ( !succes ){ 
			out(`Calculation is invalid, meaning it could not parse`);
		} 

		resultValue 	?.set(value);
		resultSuccess 	?.set(succes);
		return succes as boolean;
	}
	public static validateCalculationOrigins( calc:string , mappedOrigins:originRowData[] , out : (msg) => any 	){
		let symbols = GrobJDerivedNode.staticParseCalculationToOrigins(calc);
		mappedOrigins.forEach( o  => {
			symbols = symbols.filter( p => p != o.key );
			out( o.key + ' missing' );
		});

		let isValid = true;
		symbols.forEach( s  => {
			isValid = false;
			out(`symbol ${s} was missing from origins `);
		});

		return isValid;
	}


	// Validation 
	protected _checkIsValid(  output = true  ){
		 
		// create an out method. based in wether or not to have an output. 
		let _out = output ? (msg) => {this._outList.add(msg)} : (msg) => {};
		let isValid = super._checkIsValid( output )
 
		// Check name is valid 
		isValid = this.validateOrigins			 ( get(this.mappedOrigins) 	, get(this.calc) 			, this.system , _out ) && isValid ;
		isValid = this.validateCalculationOrigins( get(this.calc )			, get(this.mappedOrigins)	,_out ) && isValid ;
		isValid = this.validateCalculation		 ( get(this.calc )			, get(this.mappedOrigins)	,this.resultValue , this.resultSuccess , _out ) && isValid ;

		return isValid;

	}
	protected _drawMessages ( messages : string[] ){
		messages.forEach(msg => {
			this.messageHandler?.addMessageManual( msg, msg, 'error' );
		});
	}
	public checkIsValid( output = true ){  
		if (output){
			this.messageHandler?.removeAllMessages();
		}
		let valid = this._checkIsValid( output ); 
		
		if (output){
			this._drawMessages( Array.from(this._outList) );
		}
		this.isValid.set( valid ); 
		return valid;
	}  
	
	// Save
	public saveNodeChanges( ){
		let success = this.checkIsValid(true);
		if (!success){
			return false ;
		}
		
		// update all but name;
		this.node.setValue	( get(this.standardValue) );
		this.node.setCalc	( get(this.calc) );
		let NMap = get(this.mappedOrigins).filter( p => p.inCalc ); 
		
		NMap.forEach( o => {
			
			// @ts-ignore
			let dep = this.system.sys.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
			// @ts-ignore
			this.node.setOrigin( o.key , dep , o.testValue ?? 0 );
		});  

		// name triggers update 
		this.node.setName	( get(this.name) );
		this.uiNode.name = get(this.name);

		return true;	
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
				mappedOrigins = mappedOrigins.filter( p => p.key != old.key )
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
					symbols = symbols.filter( p => p != d.key );
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
*/

export class DerivedItemController2	{

	/**
	* 
	* @param system 	(optional, pass null if opting out) a System to check up nodes existing and such. 
	* @param out 		a method that takes a (Key:string, msg: string, db: string ) to handle messages for what is wrong, db is a debug Code. 
	* @param calc 		a String that represents the calculation 
	* @param origins 	an Array of references to the Origins with Symbols for the 
	* @param name		The New Name of the Node 
	* @param location 	The Collection Location for the New Node. Path to parent collection. 
	* @returns 
	*/
	public ValidateCalculation ( 
			system		: TTRPGSystem | null ,
			out			:(key:string , msg:string , db:string ) => any ,
			calc		:string ,
			origins		:originRowDataMin[],
			name?		:string,
			location?	:string
		){  
	
			// --- --- --- --- --- --- --- --- --- --- --- --- --- ---
			// --- Check optional name and Location and System.--- --- 
			// --- --- --- --- --- --- --- --- --- --- --- --- --- ---
			
			var isValid = true;
	
			// name validation.
			if ( name != null && name != undefined ){
				if (name == ''){
					isValid = false;
					out('name','The name cannot be empty', 'empty')
				}
				else if (name.includes('.')){
					isValid = false;
					out('name','The name cannot contain "."', 'illigal')
				}
	
				// we validate location and name if the location is also given. 
				else if ( location && system && system.getCollectionLoc(location)?.hasNode(name) ){
					isValid = false;
					out('name','The name is already in use, in the same collection', 'taken')
				}
			}
	
			// origins Validation
			if (origins && calc){
				
				// get the symbols
				let symbols = new Set(GrobJDerivedNode.staticParseCalculationToOrigins(calc));
	
				// go through origins and ensure that all origins have targets. 
				// (also remove symbols used from symbols leaving unused symbols)
				if ( system ){

					// if the collection doesent exists
					if (location){
						var colexists = false;
						try { colexists = !!system.getCollectionLoc(location) }
						catch(e){}
						if (!colexists){
							out( `location`, `Collection at ${location} does not exist` , 'NoLink');
							isValid = false;		
						}
					}


					// validate that the nodes exists
					for (let i = 0; i < origins.length; i++) {
						const orig = origins[i];
						symbols.delete(orig.key);
		
						// if node does not exist
						try{
							const node = system.getNodeLocString(orig.segments.join('.'));
							if (!node){
								out( `${orig.key}`, ` ${orig.key} Target of ${ orig.segments.join('.') } was did not target a Node'` , 'NoLink');
								isValid = false;
							}
						}
						catch(e){
							out( `${orig.key}`, ` ${orig.key} Target of ${ orig.segments.join('.') } was did not target a Node'`, 'LinkUnforSeen');
							isValid = false;
						}
					}
				}
	
			}

			// --- --- --- --- --- --- --- --- --- --- --- --- --- ---
			// --- Node Validation, get missing, unused--- SORT--- ---
			// --- --- --- --- --- --- --- --- --- --- --- --- --- ---

			// we sort an order some objects to better, analyse the objects.
			let symbols = GrobJDerivedNode.staticParseCalculationToOrigins(calc);
			let _origs 	: Record<string, originRowData> = {};
			let _origKeys = new Set(origins.map(p=>p.key));

			// create a mapped Origins. 
			origins.forEach( p => { _origs[p.key] = {
				key			: p.key,
				segments	: p.segments,
				active		: _origKeys.has(p.key),
				testValue	: (p.testValue ?? p.target?.getValue()) ?? 1 ,
				target		: p.target ?? null,
				inCalc 		: _origKeys.has(p.key),
				isSelectAllTarget : false
			}})

			// create lists. for deleted and unused
			let missingSymbols = symbols.filter( p => !_origKeys.has(p) );
			let unusedSymbols = Array.from(_origKeys).filter( p => !symbols.includes(p) );
		
			// mark unused symbols
			for (let i = 0; i < unusedSymbols.length; i++) {
				const sym = unusedSymbols[i];
				const orig= _origs[sym];
				orig.active = false; 
				orig.inCalc = false;
			}
			
			// add missing symbols 
			for (let i = 0; i < missingSymbols.length; i++) {
				const sym = missingSymbols[i];
				const orig :originRowData = {
					key: sym,
					segments: [],
					active: false,
					testValue: 1,
					inCalc: true,
					target: null,
					isSelectAllTarget: false
				};
				_origs[sym] = orig;
			}	

			// --- --- --- --- --- --- --- --- --- --- --- --- --- ---
			// --- Node Validation, get missing, unused--- OutPUT  ---
			// --- --- --- --- --- --- --- --- --- --- --- --- --- ---

			// Sort outgoing origins array, we do this now because its neeeded both in succes and failed runs
			var originsOut : originRowData [] = Object.values(_origs).map( p => {  
				return {
					key					: p.key,
					segments			: p.segments , 
					active				: p.active ?? false ,
					testValue			: p.testValue ?? 0,
					inCalc				: (p as originRowData ).inCalc ?? false ,
					target				: (p as originRowData ).target ?? null ,
					isSelectAllTarget	: (p as originRowData ).isSelectAllTarget ?? false 
				}
			} )

			// if not valid return invalid as a result.
			if ( !(missingSymbols.length == 0 && unusedSymbols.length == 0) || !isValid ){
				missingSymbols.forEach( p => out( p , `Missing Symbol ${p} `, 'missing'))
				unusedSymbols .forEach( p => out( p , `Had unused Symbol ${p} `, 'unused'))
				return {
					value : NaN,
					succes: false,
					origins: originsOut
				}
			}

			// --- --- --- --- --- --- --- --- --- --- --- --- --- ---
			// --- Calculate and se if it works--- --- --- --- --- --- 
			// --- --- --- --- --- --- --- --- --- --- --- --- --- ---

			// calculate and get result
			let map = {}
			Object.values(_origs).forEach( p => map[p.key] = (p.testValue));
			let res = GrobJDerivedNode.testCalculate( calc , map , false );

			// if there is an error now give that output
			if ( !res.success || Number.isNaN(res.value) ){
				out( `calc`, `calculation was invalid`, 'invalid');
			}

			return {
				value : res.value	,
				succes: res.success ,
				origins: originsOut
			}
	}  
	
	/**
	* 
	* @param system 	(optional, pass null if opting out) a System to check up nodes existing and such. 
	* @param out 		a method that takes a (Key:string, msg: string, db: string ) to handle messages for what is wrong, db is a debug Code. 
	* @param calc 		a String that represents the calculation 
	* @param origins 	an Array of references to the Origins with Symbols for the 
	* @param name		The New Name of the Node 
	* @param location 	The Collection Location for the New Node. Path to parent collection. 
	* @returns 
	*/
	public saveNodeChanges( 
		system : TTRPGSystem ,
		out:(key:string, msg:string) => any ,
		calc:string ,
		origins:originRowDataMin[],
		name:string ,
		location:string,
		value:number
	){
		
		let success = this.ValidateCalculation( system, out, calc, origins, name , location ).succes;
		if (!success){
			return false ;
		}
		
		// if node exists , get it, else create it. 
		var node : GrobDerivedNode = system.getCollectionLoc(location)?.getNode(name) as GrobDerivedNode;
		if (!node) {

			let _node = new GrobDerivedNode();
			_node.name = name;
			_node.calc = calc;
			system.getCollectionLoc(location)?.addNode(_node)
			node = system.getCollectionLoc(location)?.getNode(name) as GrobDerivedNode;
			
			if (!node) {
				throw new Error('Could not create new node');
			}
		}
		
		// update all but name;
		node.setValue	( value );
		node.setCalc	( calc );
		node.setName 	( name );

		// get each origin and add as origin.
		for (let i = 0; i < origins.length; i++) {
			const orig = origins[i];
			const target = system.getNodeLocString( orig.segments.join('.') );
			if (!target){ throw new Error('No Target at location ' + orig.segments.join('.')); }
			node.setOrigin( orig.key , target );
		}
		
		return true;	
	} 
	


	public onKeyExchange( calc:string , mappedOrigins : originRowData[] , _old:string, _new:string ){ 

		const s0 = _old;
		const s1 = _new; 
		let t0 : originRowData | undefined = mappedOrigins.find( p => p.key == s0 );
		if (!t0)
			return mappedOrigins;

		let t1 : originRowData | undefined = mappedOrigins.find( p => p.key == s1 );
		if (!t1)
			return mappedOrigins;

		// we eval if s0 is in the calc. then we need to exchange then delete. 
		t0.key = s1;
		t0.inCalc = calc.includes(s1);
		t1.key = s0;
		t1.inCalc = calc.includes(s0);

		return mappedOrigins;
	}

	public onKeyDelete(  mappedOrigins : originRowData[] , key:string ){ 

		let old : originRowData | undefined = mappedOrigins.find( p => p.key == key ); 
		if (!old){
			return mappedOrigins;
		}

		var _key = old.key;

		if (!old.active || !old.inCalc){
			mappedOrigins = mappedOrigins.filter( p => p.key != _key )
		} else {
			old.active = false;
			old.segments = new Array(3).fill(null);
		}
		return mappedOrigins; 
	}


}
