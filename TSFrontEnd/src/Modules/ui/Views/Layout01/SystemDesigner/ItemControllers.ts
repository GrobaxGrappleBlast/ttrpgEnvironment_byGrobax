
import { get, writable, type Writable } from 'svelte/store'; 
import { createEventDispatcher, onMount } from "svelte";
import { GrobJDerivedNode, GrobJFixedNode, GrobJNodeType, TTRPGSystemJSONFormatting } from '../../../../graphDesigner';
import StaticMessageHandler from '../../../Components/Messages/StaticMessageHandler.svelte'
import { GrobDerivedNode, GrobFixedNode, GrobNodeType } from 'ttrpg-system-graph';
import { AGrobNode } from 'ttrpg-system-graph/dist/Nodes/AGrobNodte';


class AItemController<T extends AGrobNode<T>> {

	public node				: T ;
	public system			: TTRPGSystemJSONFormatting ;
	public messageHandler	: StaticMessageHandler | null = null;

	public isValid		: Writable<boolean>	= writable(true); 

	// name and standard value, isvaldi are for all nodes.
	public name 		: Writable<string>	= writable(''); 
	public standardValue: Writable<number>	= writable(1);  
	
	public setControllerDeps( node, system, out : (msg) => any ){
		
		this.node	= node;
		this.system = system;

		// base for fixed items
		this.isValid 		.set(true) 
		this.name 			.set(this.node?.name	?? '') 
		this.standardValue 	.set(0) 
	} 

	// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	// --- protected validation functions- --- --- protected validation functions- ---
	// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	protected validateName( name , out : ( msg ) => any){
		
		let isValid = true; 
		if (name== ''){
			isValid = false;
			out('The name cannot be empty')
		}
		else if (name.includes('.')){
			isValid = false;
			out('The name cannot contain "."')
		}
		else if ( this.node.parent.hasNode( name ) && name != this.node.getName() ){
			isValid = false;
			out('The name is already in use, in the same collection')
		}
		return isValid;
	}

	// Validation 
	protected _outList : Set<string> = new Set();
	protected _checkIsValid(  output = true ){ 
		
		if(!this.node || !this.system){ 
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
export class DerivedItemController	extends AItemController<GrobDerivedNode> {
	
	// calc variables are for derived nodes 
	public calc			: Writable<string>	= writable(''); 
	public resultValue	: Writable<number>	= writable(0); 
	public resultSuccess: Writable<boolean>	= writable(true);
	public mappedOrigins: Writable<originRowData[]> = writable([]); 


	public setControllerDeps( node, system, out : (msg) => any ){
		
		super.setControllerDeps(node,system,out);

		// base for derived items 
		this.calc			.set(this.node?.calc ?? '');
		this.resultValue	.set(0);		
		this.resultSuccess	.set(true);	

		//for origins 
		let m = this.node?.origins?.map( p => {return {key:p.symbol, segments:p.originKey.split('.'), active: get(this.calc).includes(p.symbol), testValue: p.standardValue , inCalc: get(this.calc).includes(p.symbol) , target: p.origin , isSelectAllTarget : true }}) ?? [];	
		this.mappedOrigins	.set(m);		

	} 

	// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	// --- protected validation functions- --- --- protected validation functions- ---
	// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	protected validateOrigins(  mappedOrigins:originRowData[], calc:string , out : (msg) => any ){

		// validate that all inCalc are finished
		let isValid = true ;  
		let strOut = "";
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
			let dep = this.system.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
			if (!dep ){
				out(`Target of ${o.key} location ${o.segments[0] +'.'+ o.segments[1] +'.'+ o.segments[2] } was invalid!'`);
				isValid = false;
				return false;
			}
		}); 

		return isValid;
	}
	protected validateCalculation( calc:string , mappedOrigins:originRowData[] , out : (msg) => any ){
		
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

		this.resultValue 	.set(value);
		this.resultSuccess 	.set(succes);
		return succes as boolean;
	}
	protected validateCalculationOrigins( calc:string , mappedOrigins:originRowData[] , out : (msg) => any ){
	
		let symbols = GrobJDerivedNode.staticParseCalculationToOrigins(calc);
		mappedOrigins.forEach( o  => {
			symbols = symbols.filter( p => p != o.key );
			out( o.key + 'missing' );
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
		isValid = isValid && this.validateOrigins			( get(this.mappedOrigins) 	, get(this.calc) 			, _out );
		isValid = isValid && this.validateCalculationOrigins( get(this.calc )			, get(this.mappedOrigins)	, _out );
		isValid = isValid && this.validateCalculation		( get(this.calc )			, get(this.mappedOrigins)	, _out );

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
			let dep = this.system.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
			// @ts-ignore
			this.node.setOrigin( o.key , dep , o.testValue ?? 0 );
		});  

		// name triggers update 
		this.node.setName	( get(this.name) );

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
