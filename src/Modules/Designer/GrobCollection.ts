import { GrobGroup } from "./GrobGroup";
import { AGraphItem } from "../Abstractions/AGraphItem"; 
import type { GrobNodeType } from "../GraphV2/TTRPGSystemsGraphDependencies"; 
import { TTRPGSystemGraphAbstractModel } from "../GraphV2/TTRPGSystemGraphAbstractModel";

export type GrobCollectionType = GrobCollection<GrobNodeType>;
export class GrobCollection<T extends GrobNodeType> extends AGraphItem {
	
	constructor(name , controller : TTRPGSystemGraphAbstractModel) {
		super(name, 'C', controller)
	} 
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
		delete this.nodes_names[node.getName()];
		delete this.nodes_keys[node.getKey()];
		return this.nodes_keys[node.getKey()] == null;
	}
	public update_node_name(oldName,newName){
		this.nodes_names[newName] = this.nodes_names[oldName] ;
		delete this.nodes_names[oldName] ;
	}

	public setName( name ){
		const oldname= this.getName();
		super.setName(name);
		this.parent.update_collection_name(oldname,name);
	} 
 
}
