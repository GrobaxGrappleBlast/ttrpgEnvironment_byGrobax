import { AGraphItem } from "./Abstractions/AGraphItem"; 
import { GrobCollection } from "./GrobCollection";
import { KeyManager } from "./Abstractions/KeyManager";
import { GrobNode } from "./GrobNodte";
import type { GrobNodeType } from "./GraphV2/TTRPGSystemsGraphDependencies";
import { TTRPGSystemGraphModel } from "./GraphV2/TTRPGSystemGraphModel";
import { TTRPGSystemGraphAbstractModel } from "./GraphV2/TTRPGSystemGraphAbstractModel";

export type GrobGroupType = GrobGroup<GrobNodeType>;
export class GrobGroup<T extends GrobNodeType> extends AGraphItem {
	 
	constructor(name , controller : TTRPGSystemGraphAbstractModel) { 
		super(name,'G',controller) 
	}
   
	collections_keys: Record<string, GrobCollection<T>> = {};
	collections_names: Record<string, GrobCollection<T>> = {};
	 
	public hasCollection(name) {
		return this.collections_names[name] ? true : false;
	}
	public getCollection(name) {
		return this.collections_names[name];
	}
	public addCollection(collection: GrobCollection<T>) {
		collection.parent = this;
		this.collections_names[collection.getName()] = collection;
		this.collections_keys[collection.getKey()] = collection;
		return true;
	}  
	public removeCollection( collection : GrobCollection<T> ){ 
		delete this.collections_names[collection.getName()]; 
		delete this.collections_keys[collection.getKey()];
		return this.collections_keys[collection.getKey()] == null;
	}

	public update_collection_name(oldName,newName){ 
		this.collections_names[newName] = this.collections_names[oldName] ;
		delete this.collections_names[oldName] ;
	}
 
}