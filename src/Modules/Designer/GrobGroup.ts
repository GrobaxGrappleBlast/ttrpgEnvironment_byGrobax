import { AGraphItem } from "./Abstractions/AGraphItem"; 
import { GrobCollection } from "./GrobCollection"; 
import type { GrobNodeType } from "./GraphV2/TTRPGSystemsGraphDependencies"; 
import { JsonMappingRecordInArrayOut } from "../JSONModules/index";

export type GrobGroupType = GrobGroup<GrobNodeType>;
export class GrobGroup<T extends GrobNodeType> extends AGraphItem {
	 
	constructor(name? , parent? : any ) { 
		super(name,'G' ) 
	}
    
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
		return true;
	}  
	public removeCollection( collection : GrobCollection<T> ){ 

		const name = collection.getName();
		let c = this.collections_names[name];
		if(!c)
			return false;

		collection.dispose();
		delete this.collections_names[name]; 
		return this.collections_names[name] == null;
	}
	public update_collection_name(oldName,newName){ 
		this.collections_names[newName] = this.collections_names[oldName] ;
		delete this.collections_names[oldName] ;
	}
	
	public setName( name ){
		super.setName(name);
		for(const name in this.collections_names){
			const curr = this.collections_names[name];
			curr.updateLocation( this );
		}
	} 
	
	dispose () {
		for( const name in this.collections_names ){
			const curr = this.collections_names[name]; 
			curr.dispose(); 
			delete this.collections_names[name];
		}

		//@ts-ignore
		this.name = null;
	}

}

