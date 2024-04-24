import { GrobCollection, type GrobCollectionType } from "../GrobCollection";
import { GrobGroup, type GrobGroupType } from "../GrobGroup";
import { newOutputHandler, type IOutputHandler } from "../Abstractions/IOutputHandler"; 
import type { GrobNodeType } from "./TTRPGSystemsGraphDependencies";
import { GrobDerivedNode } from "../GrobNodte"; 

/**
* a general and flexible implementation of TTRPG system. it focusses on not diskrimination or sorting data. 
* simply having logic that is the same for everything. 
*/
export abstract class TTRPGSystemGraphAbstractModel {
	 
	
	public data : Record< string , GrobGroup<GrobNodeType> > = {} 
 
	protected out : IOutputHandler;
	public setOut( out : IOutputHandler | null  ){
		this.out = out ? out : newOutputHandler();
	}  
	
	protected _deleteGroup		(group:GrobGroupType | string ) {

		if(typeof group == 'string'){
			let g = this._getGroup(group);
			if(!g)
				return false
			group = g;
		}

		const key = group.getName();
		let g = this.data[key]
		if (!g){
			this.out.outError('tried to delete non existant group')
			return false;
		}


		group.dispose();
		delete this.data[key]; 
	}
	protected _createGroup		(name:string ) {
		if (this._hasGroup(name)){
			this.out.outError('attempted to add new group, however group already existed')
			return null;
		} 
		let gp = new GrobGroup<GrobNodeType>(name,this);
		this.data[gp.getName()] = gp;
		return gp;
	}
	protected _hasGroup		( name:string ){
		for (const key in this.data){
			if (this.data[key].getName() == name){
				return true;
			}
		}
		return false;
	}
	protected _getGroup_key ( key:string ){
		return this.data[key];
	}
	protected _getGroup ( name:string ){
		for (const key in this.data){
			if (this.data[key].getName() == name){
				return this.data[key];
			}
		}
		return null;
	}

	protected _deleteCollection	( collection:GrobCollectionType ) {

		if (!collection){
			this.out.outError(`tried to delete collection, but supplied collection was invalid`);
		}

		const group = collection.parent;
		return group.removeCollection(collection);
	}
	protected _createCollection	( group:GrobGroupType , name:string   ) {

		if (!group){
			this.out.outError(`tried to create collection, but supplied group was invalid`);
		}

		if(group.hasCollection(name)){
			this.out.outError(`Collection by that name already existed in '${group.getName()}'`);
			return null;
		}

		const collection = new GrobCollection<GrobNodeType>( name, group );
		group.addCollection(collection);
		return collection;
	}

	protected _AddNode	( collection:GrobCollectionType , node: GrobNodeType ) {
		
		if (!collection){
			this.out.outError(`tried to add node, but supplied collection was invalid`);
		}

		return collection.addNode(node);

	}
	protected _deleteNode		( node: GrobNodeType ) {
		
		const col = node.parent;
		let r = col.removeNode(node as any); 
		node.dispose();
		return r;
		
	} 


	protected _addNodeDependency( node: GrobDerivedNode, dep : GrobNodeType ){
		
		let o1 = node.addDependency(dep);
		let o2 = dep.addDependent(node);
		if ( !(o1 && o2) ){
			if(!o1){
				this.out.outError(`Could not add dependency ${dep.getName()}, on node ${node.getName()}`)
			}
			
			if(!o2){
				this.out.outError(`Could not add dependent ${node.getName()}, on node ${dep.getName()}`)
			}

			return false;
		}
		return true
	}
	protected _removeNodeDependency( node: GrobDerivedNode, dep:GrobNodeType ){
		
		let o1 = node.removeDependency(dep);
		let o2 = dep.removeDependent(node);
		if ( !(o1 && o2) ){
			if(!o1){
				this.out.outError(`Could not remove dependency ${dep.getName()}, on node ${node.getName()}`)
			} 
			if(!o2){
				this.out.outError(`Could not remove dependent ${node.getName()}, on node ${dep.getName()}`)
			} 
			return false;
		}
		return true
	}	
}