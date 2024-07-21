import { GrobCollection } from "./GrobCollection"; 
import { AGraphItem } from "./Abstractions/AGraphItem"; 
import type { GrobNodeType } from "./GraphV2/TTRPGSystemsGraphDependencies"; 
import { JsonArrayClassTyped, JsonNumber, JsonString } from "../JSONModules/index";

var grobDerivedSymbolRegex =/@[a-zA-Z]/g;

export class GrobDerivedOrigin {

	public static UnkownLocationKey = 'unknown.unknown.unknown'

	@JsonString()
	public symbol: string;
	public standardValue:number = 1;
	public origin: GrobNodeType | null;
	
	@JsonString()
	public originKey: string ;

	//public getSymbol(){}
	//public setSymbol(){}
	//public getStandardValue(){}
	//public setStandardValue(){}
	//public getOrigin(){}
	//public setOrigin(){}

}


export abstract class GrobNode<T extends GrobNode<T>> extends AGraphItem{

	constructor(name? , keystart? , parent? : GrobCollection<GrobNodeType> ) {  
		super(name, keystart) 
		if(parent)
			this.parent = parent;
	}
	
	// @ts-ignore
 	parent: GrobCollection<GrobNodeType>;

	public dependencies :Record<any,GrobNodeType> = {};
	public dependents : Record<any,GrobNodeType> = {};

	public static getTypeString(): string{
		return 'Nodte<T extends Nodte<T>>';
	}

	public addDependent(node: GrobNodeType ) : boolean {
		const key = node.getKey();

		if(this.dependents[key]){
			return true;
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
	abstract nullifyDependency( node:GrobNodeType ): boolean

	public getDependencies(): GrobNodeType[] {
		//@ts-ignore
		return Object.values( this.dependencies ) as GrobNodeType[] ?? [];
	}

	abstract getValue() : number  
 
	public getLocationKey(){
		let segs = this.getLocationKeySegments();
		return segs.join('.');
	}
	public getLocationKeySegments() : string [] {
		let seg : string[] = ['','',''];
		seg[0] = this.parent?.parent?.getName() ?? 'unknown';
		seg[1] = this.parent?.getName () ?? 'unknown';
		seg[2] = this.getName() ?? 'unknown';
		return seg;
	}
	public update( ){
		return true;
	}

	dispose () {
		// delete references all
		

		for(const key in this.dependencies){
			const curr = this.dependencies[key]
			curr.removeDependent(this as any)
		}
		
		for(const key in this.dependents){
			const curr = this.dependents[key]
			curr.nullifyDependency(this as any)
		}

		//@ts-ignore
		this.parent = null;
		//@ts-ignore
		this.name = null;

	}

	public setName( name ){
		const oldname= this.getName();
		super.setName(name);
		this.parent.update_node_name(oldname,name); 
		this.updateLocation(this.parent);
	} 
	updateLocation( parent ){
		this.parent = parent;
		for(const key in this.dependents){
			const dep = this.dependents [key];
			dep.updateDependecysLocation(this)
		}
	}

	public updateDependecysLocation( dependency ){}

	public isValid(  ){
		return true;
	}
}
  
export class GrobFixedNode extends GrobNode<GrobFixedNode>{
	
	constructor(name ,  parent? : GrobCollection<GrobFixedNode>) {  
		super(name ,'NF',parent) 
	}

	@JsonNumber({name : 'standardValue'})
	public ___value:number= 1;

	getValue(): number {
		return this.___value;
	} 
	setValue( value : number ) {
		this.___value = value;
		for(const key in this.dependents){
			const curr = this.dependents[key] as GrobDerivedNode;
			curr.update();
		}
	} 
	
	public static  getTypeString(): string {
		return 'fixedNode';
	}  
	public getTypeString(){
		return GrobFixedNode.getTypeString();
	}

	public addDependency(node:GrobNodeType){ return false } 
	public removeDependency(node:GrobNodeType){ return false  }
	public nullifyDependency(node:GrobNodeType){return false}
	
}
 

export class GrobDerivedNode extends GrobNode<GrobDerivedNode> {
	
	constructor(name? , parent? : GrobCollection<GrobDerivedNode> ) {  
		super(name  ,'ND', parent)  
	}

	@JsonString({name : 'calculationString'})
	public calc:string = '@a';

	@JsonArrayClassTyped(GrobDerivedOrigin,{name:'calcOrigins'})
	public origins : GrobDerivedOrigin[] = [];
	private _value : number = NaN;

	getValue(): number {
		return this._value;
	} 
	setValue( value : number ){
		this._value = value;
	}

	public static getTypeString(): string {
		return 'derivedNode';
	}	
	public getTypeString(){
		return GrobDerivedNode.getTypeString();
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
	public nullifyDependency(node:GrobNodeType){
		// first Empty the origin.
		let key = node.getKey();
		let orig = this.origins.find( p => p.origin?.getKey() == key );
		if(orig){
			orig.origin = null;	
			orig.originKey = GrobDerivedOrigin.UnkownLocationKey;
		}
		
		// then nulify the dependency
		return this.removeDependency(node);
	}
	
	public setOrigin( symbol, node : GrobNodeType , standardValue : number | null = null ){


		let origin = this.origins.find( p => p.symbol == symbol );
		if(!origin){
			return false;
		} 

		if(origin.origin){
			this.removeDependency(origin.origin)
		}

		// ensure that this is the right type of object.
		const nodeKey = node?.getTypeString() ?? '';
		if(!['derivedNode','fixedNode'].find( p => p == nodeKey)){
			//@ts-ignore
			node = null;
		}

		if(node){
			this.addDependency(node)
		}

		origin.origin = node;
		origin.standardValue = (standardValue ?? origin.standardValue) ?? 1; 

		if(origin.origin)
			origin.originKey = origin.origin.getLocationKey();

		if (this.isValid()) {
			this.recalculate(false);
		}
		
		return true;
	}
	public isValid(){
		
		let hadNullOrigin = false;
		this.origins.forEach( o  => {
			if ( ! o.origin ){
				hadNullOrigin = true;
			}
		});
		if(hadNullOrigin){
			return false;
		}
		
		let originsWithLinks = this.origins.filter(p => p.origin != null )
		if(originsWithLinks.length != this.getDependencies().length){
			return false;
		}
		
		return true;

	}
	public updateOrigins(){
		 
		let originRes	= this.parseCalculationToOrigins(this.calc);
		if( originRes ) {
			let symbolsToRem = originRes.symbolsToRem;
			let symbolsToAdd = originRes.symbolsToAdd;

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
					orig.originKey = GrobDerivedOrigin.UnkownLocationKey;
					this.origins.push(orig);
				}
			}

			// handle Dependencies 
			let oldDependencies : Record<string,GrobNodeType > = {};
			this.getDependencies().forEach(p => oldDependencies[p.getName()] = p );

			let newDependencies : Record<string,GrobNodeType >= {};
			this.origins.forEach( p => { if(p.origin != null){ newDependencies[ p.origin?.getName()] = p.origin }});

			// remove old Dependencies 
			for(const key in oldDependencies){
				if(!newDependencies[key]){
					this.removeDependency(oldDependencies[key]);
				}
			}
		 
			return {added:symbolsToAdd , removed:symbolsToRem.length };
		}
		else {
			return {added:0, removed:0};
		}
	}
	public setCalc ( calc , updateOrigins = true ){
		
		// reset This' Value;
		this._value = NaN;
		
		// test if it is calculateable
		let testCalc	= this.testCalculate(calc);
		if( testCalc == null || !testCalc.success ){
			return false;
		}
		this.calc = calc;

		// update origins.
		if(updateOrigins) {
			this.updateOrigins();	
		}
 
		if (this.isValid()) {
			this.recalculate(false);
		}

		return true;
	}


	/**
	 * Parses calculation To a Number of Origins.
	 * @returns  
	 */
	public parseCalculationToOrigins( calc:string ) :  {symbolsToRem:string[] , symbolsToAdd:string[] , totalSymbols: string[] } | null { 
		
		const calcValue = calc; 

		// get symbols from the calc. and turn it into an array. important, the array is an array of unique keys.
		let symbols :string[] = calcValue.match( grobDerivedSymbolRegex ) ?? [];
		symbols = Array.from(new Set(symbols))

		// get the keys that are already there.
		let existingKeysArray 	= this.origins.map( p => p.symbol );

 
		// get a list of symbols to add and remove.
		let symbolsToAdd = symbols.filter( p => !existingKeysArray.includes(p) )
		let symbolsToRem = existingKeysArray.filter( p => !symbols.includes(p) );
		 
		return {symbolsToRem:symbolsToRem , symbolsToAdd:symbolsToAdd , totalSymbols: symbols} ;
	}
	public static staticParseCalculationToOrigins( calc:string ) : string[] { 
		const calcValue = calc; 

		// get symbols from the calc. and turn it into an array. important, the array is an array of unique keys.
		let symbols :string[] = calcValue.match( grobDerivedSymbolRegex ) ?? [];
		symbols = Array.from(new Set(symbols))
		return symbols;
	}
	

	public recalculate( useTempValues = false ){ 
		
		//const symbols = this.calc.match( grobDerivedSymbolRegex );  
		let rec : Record<string,number> = 
			useTempValues ?
			Object.fromEntries( this.origins.map(p => [ p.symbol, p.standardValue ])) 		as Record<string,number>:	
			Object.fromEntries( this.origins.map(p => [ p.symbol, p.origin?.getValue() ])) 	as Record<string,number>;
		let statement = this.calc;
		let res = this._recalculate(rec,statement);
		this._value = res.value;
		return res.success;
	}
	private _recalculate(  rec : Record<string,number> = {} , statement ){
		return GrobDerivedNode.recalculate(rec,statement);
	}
	private static recalculate(  rec : Record<string,number> = {} , statement ){
		
		const symbols = statement.match( grobDerivedSymbolRegex );  
		//let rec = 
		//	useTempValues ?
		//	Object.fromEntries( origins.map(p => [ p.symbol, p.standardValue])):	
		//	Object.fromEntries( origins.map(p => [ p.symbol, p.origin?.getValue() ]));
		
		let _statement = statement;
		symbols?.forEach( key => { 
			const v =  rec[key] ;
			_statement = _statement.replace( key , v + "" );
		}); 

		var recalcSuccess = false;
		let value = 0;
		try{
			var res = eval(_statement);  
			if(typeof res === 'number'){
				recalcSuccess = true; 
				value = res;
			}
			else{
				recalcSuccess = false;
				value = NaN;
			}
		}catch(e){ 
			recalcSuccess = false;
			value = NaN;
		}  
		return { success:recalcSuccess, value:value};
	}

	public testCalculate( statement ){
		const symbols = statement.match( grobDerivedSymbolRegex );  
		let rec = symbols ? Object.fromEntries( symbols.map( s => [s,1])) : {};
		let res = this._recalculate(rec,statement); 
		return res;
	}
	public static testCalculate( statement : string  , symbolsToValue : Record<string,number> = {}){
		const symbols = statement.match( grobDerivedSymbolRegex );  
		function mapValueToSymbol( s,m ){
			if (m[s]){
				return m[s];
			}
			return 1;
		}

		let rec = symbols ? Object.fromEntries( symbols.map( s => [s,mapValueToSymbol(s,symbolsToValue)])) : {};
		let res = GrobDerivedNode.recalculate(rec,statement); 
		return res;
	}

	public update( ){

		if(!this.isValid()){
			console.error(`Node isent Valid ${this.getName()} ${this.getLocationKey()} Stopping update`);
			return false;
		}

		// first recalculate
		this.recalculate();

		// then call update for all dependents 
		let success = true;
		for( const k in this.dependents ){
			const dep = this.dependents[k] as GrobDerivedNode;
			success = success && dep.update();
		} 
		return success;
	}

	public updateDependecysLocation( dependency ){
		let orig = this.origins.find( p => p.origin?.getName() == dependency.getName() );
		if(!orig)
			return;

		orig.originKey = dependency.getLocationKey();
	}

}
