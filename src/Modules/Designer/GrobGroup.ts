import { AGraphItem } from "./Abstractions/AGraphItem"; 
import { GrobCollection } from "./GrobCollection";
import { KeyManager } from "./Abstractions/KeyManager";
import { GrobDerivedNode, GrobFixedNode, GrobNode } from "./GrobNodte";
import type { GrobNodeType } from "./GraphV2/TTRPGSystemsGraphDependencies"; 
import { JsonMappingRecordInArrayOut } from "../JSONModules/index";

export type GrobGroupType = GrobGroup<GrobNodeType>;
export class GrobGroup<T extends GrobNodeType> extends AGraphItem {
	 
	constructor(name? , parent? : any ) { 
		super(name,'G' ) 
	}
   
	collections_keys: Record<string, GrobCollection<T>> = {};

	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName', type :GrobCollection<GrobNodeType> })
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

		const name = collection.getName();
		const key = collection.getKey();
		let c = this.collections_names[name];
		if(!c)
			return false;

		collection.dispose();
		delete this.collections_names[name]; 
		delete this.collections_keys[key];
		return this.collections_keys[key] == null;
	}
	public update_collection_name(oldName,newName){ 
		this.collections_names[newName] = this.collections_names[oldName] ;
		delete this.collections_names[oldName] ;
	}
	
	public setName( name ){
		super.setName(name);
		for(const key in this.collections_keys){
			const curr = this.collections_keys[key];
			curr.updateLocation( this );
		}
	} 
	
	dispose () {
		for( const key in this.collections_keys ){
			const curr = this.collections_keys[key];
			const name = curr.getName();
			curr.dispose();
			delete this.collections_keys[key];
			delete this.collections_names[name];
		}
 
		this.key = null;
		//@ts-ignore
		this.name = null;
	}

}

