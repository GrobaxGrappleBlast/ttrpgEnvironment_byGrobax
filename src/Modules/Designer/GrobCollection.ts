import { GrobGroup } from "./GrobGroup";
import { AGraphItem } from "./Abstractions/AGraphItem"; 
import type { GrobNodeType } from "./GraphV2/TTRPGSystemsGraphDependencies"; 
import { TTRPGSystemGraphAbstractModel } from "./GraphV2/TTRPGSystemGraphAbstractModel";
import { JsonMapping, JsonMappingRecordInArrayOut } from "../JSONModules/index";
  
export type GrobCollectionType = GrobCollection<GrobNodeType>;


export class GrobCollection<T extends GrobNodeType> extends AGraphItem {
	
	constructor(name? ,parent? : GrobGroup<T>) {
		super(name, 'C')
	} 
	
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getKey',name:'data'})
	nodes_keys: Record<string, T> = {}
	nodes_names: Record<string, T> = {}
	parent: GrobGroup<T>; 

	public hasNode(name) {
		return this.nodes_names[name] ? true : false;
	}
	public getNode(name): T  {
		return this.nodes_names[name] ?? null ;
	}
	public addNode(node: T) {
		//@ts-ignore
		node.parent = this;
		this.nodes_names[node.getName()] = node;
		this.nodes_keys[node.getKey()] = node;
		return true;
	}  
	public removeNode(node : T){

		const name = node.getName();
		const key = node.getKey();
		let n = this.nodes_names[name];
		if(!n)
			return false;

		n.dispose();

		delete this.nodes_names[name];
		delete this.nodes_keys[key];
		return this.nodes_keys[key] == null;
	}
	public update_node_name(oldName,newName){
		this.nodes_names[newName] = this.nodes_names[oldName] ;
		delete this.nodes_names[oldName] ;
	}

	public setName( name ){
		const oldname= this.getName();
		super.setName(name);
		this.parent.update_collection_name(oldname,name);

		this.updateLocation(this.parent);
	} 
	updateLocation( parent ){
		this.parent = parent;
		for(const key in this.nodes_keys){
			const curr = this.nodes_keys[key];
			curr.updateLocation( this );
		}
	}
 
	dispose () {
		
		for( const key in this.nodes_keys ){
			const curr = this.nodes_keys[key];
			const name = curr.getName();
			curr.dispose();
			delete this.nodes_keys[key];
			delete this.nodes_names[name];
		}

		// @ts-ignore
		this.parent = null;
		this.key = null;
		//@ts-ignore
		this.name = null;
		
	} 
}
