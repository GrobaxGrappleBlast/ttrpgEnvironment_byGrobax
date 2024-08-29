import { AGraphItem } from "./Abstractions/AGraphItem"; 
import type { GrobNodeType } from "./GraphV2/TTRPGSystemsGraphDependencies";  
import type { IGrobCollection } from "./IGrobCollection";
import type { IGrobGroup } from "./IGrobGroup";



export class GrobCollection<T extends GrobNodeType> extends AGraphItem implements IGrobCollection<T> {
	
	constructor(name? ,parent? : IGrobGroup<T> ) {
		super(name, 'C')
	} 
	
	nodes_names: Record<string, T> = {}
	parent: IGrobGroup<T>; 


	public getNodeNames(){
		return Object.keys( this.nodes_names );
	}
	public getNodes(){
		return Object.values( this.nodes_names );
	}

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
		return true;
	}  
	public removeNode(node : T){

		if(!node)
		{
			console.error('attempted to delete node "Null" ');
			return false
		}

		const name = node.getName(); 
		let n = this.nodes_names[name];
		if(!n)
			return false;

		n.dispose();

		delete this.nodes_names[name]; 
		return this.nodes_names[name] == null;
	}
	public update_node_name(oldName,newName){

		if (oldName == newName)
			return;

		this.nodes_names[newName] = this.nodes_names[oldName] ;
		delete this.nodes_names[oldName] ;
	}

	public setName( name ){
		
		const oldname= this.getName();
		if(oldname == name){
			return;
		}
		
		super.setName(name);
		this.parent.update_collection_name(oldname,name);

		this.updateLocation(this.parent);
	} 
	updateLocation( parent ){
		this.parent = parent;
		for(const name in this.nodes_names){
			const curr = this.nodes_names[name];
			curr.updateLocation( this );
		}
	}
	dispose () {
		
		for( const name in this.nodes_names ){
			const curr = this.nodes_names[name]; 
			curr.dispose(); 
			delete this.nodes_names[name];
		}

		// @ts-ignore
		this.parent = null; 
		//@ts-ignore
		this.name = null;
		
	} 
}

  
export type GrobCollectionType = GrobCollection<GrobNodeType>;

