import { Collection } from "./Collection";
import { Nodte } from "./Nodte";

type constructorMethod<T> = { new (...args: any[]): T };
export class Group<T extends Nodte<T>>{
	
	private TName : string;
	private TConstructor: constructorMethod<T>;
	constructor(name, generic : constructorMethod<T> ) {
		this.name = name;
		this.TName = generic.name;
		this.TConstructor = generic;
	}
	name: string
	collections: Record<string, Collection<T>> = {};
	public hasCollection(colName) {
		return (this.collections[colName] ?? false ) ? true : false;
	}
	public getCollection(colName) {
		return this.collections[colName];
	}
	public addCollection(collection: Collection<T>) {
		collection.parent = this;
		this.collections[collection.name] = collection;
		return true;
	}

	public hasNode(colKey: string, nodeKey: string) {
		this.collections[colKey]?.hasNode(nodeKey);
	}

	public isCorrectType(t: T): boolean {
		const constructor = Object.getPrototypeOf(t).constructor;
		return t instanceof constructor;
	}
	public getNodeTypeString(){
		return this.TName;
	}
	public createNewNodeInstance( name : string ) : T {
		return new this.TConstructor(name);
	}
}