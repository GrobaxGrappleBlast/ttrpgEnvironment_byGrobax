import { Collection } from "./Collection";

export class derivedOrigin {
	public symbol: string;
	public standardValue:number;
	public origin: Nodte<any>
}



export abstract class Nodte<T extends Nodte<T>>{
	constructor(name) {
		this.name = name;
	}
	name: string
	parent: Collection<T>;
	public static getTypeString(): string{
		return 'Nodte<T extends Nodte<T>>';
	}

	abstract getValue() 

}
export class fixedNode extends Nodte<fixedNode>{
	getValue(): void {
		throw new Error("Method not implemented.");
	}

	// Dependencies are always empty
	public dependencies : Nodte<any>[] = []; 
	public dependents : derivedNode[] = [];

	
	public static  getTypeString(): string {
		return 'fixedNode';
	}


}
export class derivedNode extends Nodte<derivedNode>{
	getValue(): void {
		throw new Error("Method not implemented.");
	}

	public calcString:string;
	public origins : derivedOrigin[] = [];
	public dependencies : Nodte<any>[] = [];
	public dependents : derivedNode[] = [];

	public static getTypeString(): string {
		return 'derivedNode';
	}
}
