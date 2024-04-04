import { GrobCollection } from "./GrobCollection"; 
import { AGraphItem } from "./Abstractions/AGraphItem"; 
import type { GrobNodeType } from "./GraphV2/TTRPGSystemsGraphDependencies"; 
import { TTRPGSystemGraphAbstractModel } from "./GraphV2/TTRPGSystemGraphAbstractModel";
import type { NodeType } from "yaml/dist/nodes/Node";

 
export abstract class GrobNode<T extends GrobNode<T>> extends AGraphItem{

	constructor(name , keystart , controller : TTRPGSystemGraphAbstractModel) {  
		super(name, keystart,controller) 
	}
	
	// @ts-ignore
 	parent: GrobCollection<T>;

	public dependencies :Record<any,GrobNodeType> = {};
	public dependents : Record<any,GrobNodeType> = {};

	public static getTypeString(): string{
		return 'Nodte<T extends Nodte<T>>';
	}

	public addDependent(node: GrobNodeType ) : boolean {
		const key = node.getKey();

		if(this.dependents[key]){
			return false;
		}

		this.dependents[key] = node;
		return true;
	} 
	public removeDependent(node:GrobNodeType) : boolean{
		delete this.dependents[node.getKey()];
		return this.dependents[node.getKey()] == null;
	}
	public getDependents(): GrobNodeType[] {
		//@ts-ignore
		return Object.values( this.dependents ) as GrobNodeType[] ?? [];
	}

	abstract addDependency( node:GrobNodeType) : boolean 
	abstract removeDependency( node:GrobNodeType)  : boolean
	public getDependencies(): GrobNodeType[] {
		//@ts-ignore
		return Object.values( this.dependencies ) as GrobNodeType[] ?? [];
	}

	abstract getValue() : number 
	public setName( name ){
		const oldname= this.getName();
		super.setName(name);
		this.parent.update_node_name(oldname,name);
	} 

	public getGraphLocationKey(){
		return this.parent?.parent?.getName()??  +'.'+ this.parent.getName() +'.'+ this.getName()
	}
	public getLocationKey(){
		let segs = this.getLocationKeySegments();
		return segs.join('.');
	}
	public getLocationKeySegments() : string [] {
		let seg : string[] = ['','',''];
		seg[0] = this.parent?.parent?.getName() ?? 'unknown';
		seg[1] = this.parent?.getName() ?? 'unknown';
		seg[2] = this.getName() ?? 'unknown';
		return seg;
	}

}
  
export class GrobFixedNode extends GrobNode<GrobFixedNode>{
	
	constructor(name , controller : TTRPGSystemGraphAbstractModel) {  
		super(name ,'NF',controller) 
	}

	private ___value:number= 1;
	getValue(): number {
		return this.___value;
	} 
	setValue( value : number ) {
		this.___value = value;
	} 
	
	public static  getTypeString(): string {
		return 'fixedNode';
	}  
	public getTypeString(){
		return GrobFixedNode.getTypeString();
	}

	public addDependency(node:GrobNodeType){ return false } 
	public removeDependency(node:GrobNodeType){ return false  }
}
 
var grobDerivedSymbolRegex =/@[a-zA-Z]/g;
export class GrobDerivedNode extends GrobNode<GrobDerivedNode> {
	
	constructor(name , controller : TTRPGSystemGraphAbstractModel) {  
		super(name  ,'ND' ,controller)  
	}
	public calc:string = '@a';
	public origins : GrobDerivedOrigin[] = [];

	public setOrigin( symbol, node : GrobNodeType, standardValue : number | null = null ){
		let origin = this.origins.find( p => p.symbol == symbol );
		if(!origin){
			return false;
		}

		origin.origin = node;
		origin.standardValue = (standardValue ?? origin.standardValue) ?? 1;
	}

	public setCalc ( calc ){
		
		let newOrigins	= this.testParseCalculation(calc, this.origins);
		let testCalc	= this.testCalculate(calc,false,true);
		if( newOrigins.length == 0	|| testCalc == null ){
			return false;
		}

		this.origins = newOrigins;
		this.calc = calc;
		return true;
	}

	public static getTypeString(): string {
		return 'derivedNode';
	}	

	public getTypeString(){
		return GrobDerivedNode.getTypeString();
	}
	
	// TODO : reeval if this is needed, or how to handle origins.
	public addOriginDependency(symbol:string, dep:GrobNodeType){

		const i = this.origins.findIndex( p => p.symbol == symbol );
		if( i == -1 ){
			return false;
		}

		this.origins[i].origin = dep;
		this.addDependency(dep);
		return true; 
	}

	public addDependency(node:GrobNodeType){
		const key = node.getKey()
		this.dependencies[key] = node; 

		node.addDependent(this);
		return true;
	}
 
	public removeDependency(node:GrobNodeType){
		 
		// delete the dependency
		const key = node.getKey()
		if(this.dependencies[key]){
			delete this.dependencies[key];
			node.removeDependent(this);
		}

		// remove origin dependency 
		// we find the origin, with the key value, and remove it.
		for (let i = 0; i < this.origins.length; i++) {
			const orig = this.origins[i];
			if(orig.origin != null && orig.origin.getKey() == key){
				orig.origin = null;
			}
		}  

		return this.dependencies[key] == null ;
	}

	getValue(): number {
		return this._value;
	}
	private _value : number = 1;

	public parseCalculation(){ 
		 
		const calcValue = this.calc; 

		// get symbols from the calc. and turn it into an array. important, the array is an array of unique keys.
		let symbols :string[] = calcValue.match( grobDerivedSymbolRegex ) ?? [];
		symbols = Array.from(new Set(symbols))

		// get the keys that are already there.
		let existingKeysArray 	= this.origins.map( p => p.symbol );
		if(symbols == null){ 
			return false;
		}
 
		// get a list of symbols to add and remove.
		let symbolsToAdd = symbols.filter( p => !existingKeysArray.includes(p) )
		let symbolsToRem = existingKeysArray.filter( p => !symbols.includes(p) );
		
		// remove symbols 
		if ( symbolsToRem.length != 0){
			this.origins = this.origins.filter(p => !symbolsToRem.includes(p.symbol) );
		}

		// add items if there is anything to add.  
		if( symbolsToAdd.length != 0){
			for (let i = 0; i < symbolsToAdd.length; i++) {
				const orig = new GrobDerivedOrigin();
				orig.symbol = symbolsToAdd[i];
				orig.standardValue = 1;
				orig.origin = null;
				this.origins.push(orig);
			}
		}

		return true;
	}

	public testParseCalculation( calculation ,  origins : GrobDerivedOrigin[] = [] ){ 

		// get symbols from the calc. and turn it into an array. important, the array is an array of unique keys.
		let symbols :string[] = calculation.match( grobDerivedSymbolRegex ) ?? [];
		symbols = Array.from(new Set(symbols))

		// get the keys that are already there.
		let existingKeysArray 	= origins.map( p => p.symbol );
		if(symbols == null){ 
			return [];
		}
 
		// get a list of symbols to add and remove.
		let symbolsToAdd = symbols.filter( p => !existingKeysArray.includes(p) )
		let symbolsToRem = existingKeysArray.filter( p => !symbols.includes(p) );
		
		// remove symbols 
		if ( symbolsToRem.length != 0){
			origins = origins.filter(p => !symbolsToRem.includes(p.symbol) );
		}

		// add items if there is anything to add.  
		if( symbolsToAdd.length != 0){
			for (let i = 0; i < symbolsToAdd.length; i++) {
				const orig = new GrobDerivedOrigin();
				orig.symbol = symbolsToAdd[i];
				orig.standardValue = 1;
				orig.origin = null;
				origins.push(orig);
			}
		}

		return origins;
	}

	public recalculate( useTempValues = false ){ 
		
		const symbols = this.calc.match( grobDerivedSymbolRegex );  
		let rec = 
			useTempValues ?
			Object.fromEntries( this.origins.map(p => [ p.symbol, p.standardValue])):	
			Object.fromEntries( this.origins.map(p => [ p.symbol, p.origin?.getValue() ]));
		let statement = this.calc;

		symbols?.forEach( key => { 
			const v =  rec[key] ;
			statement = statement.replace( key , v + "" );
		}); 

		var recalcSuccess = false;
		try{
			var res = eval(statement);  
			if(typeof res === 'number'){
				recalcSuccess = true; 
				this._value = res;
			}
			else{
				recalcSuccess = false;
				this._value = 0;
			}
		}catch(e){ 
			recalcSuccess = false;
		}  
		return recalcSuccess;
	}

	public testCalculate( statement, useTempValues = false, overrideAndUse1Values = false ){
		const symbols = this.calc.match( grobDerivedSymbolRegex );  
		
		let rec = 
			// if override is set, just set value to 1
			overrideAndUse1Values ?
			Object.fromEntries( this.origins.map(p => [ p.symbol, 1])):	

			// else if use temp values, use temp values
			useTempValues ?
			Object.fromEntries( this.origins.map(p => [ p.symbol, p.standardValue])):	

			// else get Actual values 
			Object.fromEntries( this.origins.map(p => [ p.symbol, p.origin?.getValue() ]));

		symbols?.forEach( key => { 
			const v =  rec[key] ;
			statement = statement.replace( key , v + "" );
		}); 

		var result : number | null = null ;
		try{
			var res = eval(statement);  
			if(typeof res === 'number'){
				result = res;
			}
			
		}catch(e){ 
			
		}  
		return result;
	}
	public update( ){
		// first recalculate
		this.recalculate();

		// then call update for all dependents 
		for( const k in this.dependents ){
			const dep = this.dependents[k] as GrobDerivedNode;
			dep.update();
		} 
	}
}

export class GrobDerivedOrigin {
	public symbol: string;
	public standardValue:number;
	public origin: GrobNode<any> | null;
}

