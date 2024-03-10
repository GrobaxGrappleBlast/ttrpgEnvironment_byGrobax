import { Collection } from "./Collection";




export abstract class Nodte<T extends Nodte<T>>{
	constructor(name) {
		this.name = name;
	}
	name: string
	parent: Collection<T>;

	public dependencies :Record<string,NodeType> = {};
	public dependents : Record<string,NodeType> = {};

	public static getTypeString(): string{
		return 'Nodte<T extends Nodte<T>>';
	}

	public addDependent(node: NodeType ){
		const key = node.getKey();
		this.dependents[key] = node;
		return true;
	}
	public removeDependentByKey(key:string){
		delete this.dependents[key];
		return true;
	} 
	public removeDependent(node:NodeType){
		const key = node.parent.parent.name +'.' + node.parent.name +'.' + node.name;
		this.removeDependentByKey(key);
	}

	abstract addDependency( node:NodeType) 
	abstract removeDependencyByKey(name:string)
	abstract removeDependency( node:NodeType) 
	abstract getValue() : number 

	public getKey(){
		let key = (this.parent?.parent?.name ) + '.' + (this.parent?.name ) + '.' + (this.name );
		return key;
	}
	public getKeySegments(){
		let keys = [this.parent?.parent?.name , this.parent?.name , this.name ];
		return keys;
	}

}

export type NodeType = fixedNode | derivedNode;

export class fixedNode extends Nodte<fixedNode>{
	getValue(): number {
		return 1;
	}
	
	public static  getTypeString(): string {
		return 'fixedNode';
	}

	public addDependency(node:NodeType){}
	public removeDependencyByKey(key:string){}
	public removeDependency(node:NodeType){}
}

export class derivedOrigin {
	public symbol: string;
	public standardValue:number;
	public origin: Nodte<any>
}


var derivedSymbolRegex =/@[a-zA-Z]/g;
export class derivedNode extends Nodte<derivedNode>{
	

	public calc:string = '@a';
	public origins : derivedOrigin[] = [];

	public static getTypeString(): string {
		return 'derivedNode';
	}	
	
	public addDependency(node:NodeType){
		const key = node.getKey()
		this.dependencies[key] = node; 
	}
	public removeDependencyByKey(name:string){
		delete this.dependencies[name]; 
	}
	public removeDependency(node:NodeType){
		const key = node.getKey()
		this.removeDependencyByKey(key);
	}

	getValue(): number {
		return this._value;
	}
	private _value : number = 1;

	public recalculate(){ 
		
		const symbols = this.calc.match( derivedSymbolRegex );  
		let rec = Object.fromEntries( this.origins.map(p => [ p.symbol, p.standardValue]));
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
}
