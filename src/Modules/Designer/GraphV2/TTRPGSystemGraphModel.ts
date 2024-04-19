import { GrobCollection, type GrobCollectionType } from "../GrobCollection";
import { GrobGroup, type GrobGroupType } from "../GrobGroup";
import { newOutputHandler, type IOutputHandler } from "../Abstractions/IOutputHandler"; 
import type { GrobNodeType } from "./TTRPGSystemsGraphDependencies";
import { GrobDerivedNode, GrobFixedNode } from "../GrobNodte";
import { TTRPGSystemGraphAbstractModel } from "./TTRPGSystemGraphAbstractModel"; 

const derived 	= 'derived';
const fixed 	= 'fixed';
export type groupKeyType = 'fixed' | 'derived';

/**
 *  handles Model operations and Data Containment, 
 * Ensures that data is maintained, as well as graphlinks
*/
export class TTRPGSystemGraphModel extends TTRPGSystemGraphAbstractModel {
	  
	private fixed : GrobGroup<GrobFixedNode>;
	private derived:GrobGroup<GrobDerivedNode>;
	private fixedKey:any;
	private derivedKey:any;

	public constructor(){
		super();

		// create the main groups;  
		this.fixed 		= this._createGroup( 'fixed' ) 	 as GrobGroup<GrobFixedNode>;
		this.derived 	= this._createGroup( 'derived' ) as GrobGroup<GrobDerivedNode>; 
		this.fixedKey 	= this.fixed.getKey();
		this.derivedKey = this.derived.getKey();
		this.setOut( newOutputHandler() );
	}

	/// Create Statements 
	public createCollection( group : groupKeyType , name : string){
		
		// ensure that group exists, same way as the others
		if(!this._hasGroup(group)){
			this.out.outError(`No group existed by name ${group}`)
		}
		

		if(group == 'fixed'){
			return this._createCollection(this.fixed , name);
		} 
		else if(group == 'derived'){
			return this._createCollection(this.derived, name);
		}
		return null;
	}
	public createDerivedCollection( name : string){
		return this.createCollection(derived, name);
	}
	public createFixedCollection(name : string){
		return this.createCollection(fixed, name);
	}
	public createNode( group : groupKeyType ,col : GrobCollection<GrobNodeType> | string , name : string){
		
		// ensure that group exists, same way as the others
		if(!this._hasGroup(group)){
			this.out.outError(`No group existed by name ${group}`)
			return null;
		}

		if(this.hasNode(group,col,name)){
			this.out.outError(`Node by this name already existed ${group}`)
			return null;
		}

		if(group == 'fixed'){
			return this.createFixedNode(col  as GrobCollection<GrobFixedNode> | string ,name);
		} 
		else if(group == 'derived'){
			return this.createDerivedNode(col as GrobCollection<GrobDerivedNode> | string ,name);
		}
		return null;
	}
	public createDerivedNode( col : GrobCollection<GrobDerivedNode> | string , name : string){
		
		let colName = col;
		if( typeof col !== 'string'){
			// @ts-ignore
			colName = col.getName();
		}

		const _col = this.derived.getCollection(colName);
		if(!_col){
			this.out.outError(`No Derived collection found by name: ${colName} `);
			return null;
		}

		const node = new GrobDerivedNode(name,this);
		_col.addNode(node); 
		
	}
	public createFixedNode( col : GrobCollection<GrobFixedNode> | string  , name : string){
		
		let colName = col;
		if( typeof col !== 'string'){
			// @ts-ignore
			colName = col.getName();
		}

		const _col = this.fixed.getCollection(colName);
		if(!_col){
			this.out.outError(`No Fixed collection found by name: ${colName} `);
			return null;
		}

		const node = new GrobFixedNode(name,this);
		_col.addNode(node); 

	}



	// has Statements 
	public hasCollection( group : groupKeyType , name : string){
		
		const grp = this._getGroup(group);
		if(!grp){
			this.out.outError(`No group existed by name ${group}`)
			return null;
		}

		const col = grp.getCollection(name) ;
		return col ? true: false;
	}
	public hasDerivedCollection(name:string){
		return this.hasCollection(derived,name);
	}
	public hasFixedCollection(name:string){
		return this.hasCollection(fixed,name);
	}
	public hasNode( group : groupKeyType , col : GrobCollection<GrobNodeType> | string , name : string){
		const grp = this._getGroup(group);
		if(!grp){
			this.out.outError(`No group existed by name ${group}`)
			return false;
		}

		let _col = col;
		if( typeof col === 'string'){
			// @ts-ignore
			_col = this.getDerivedCollection(name); 
			if(!_col){
				this.out.outError(`attempted to get ${group} collection ${name}, but no collection existed by that name`);
				return false
			}
		} 
		return (_col as GrobCollection<GrobNodeType>).hasNode(name);
	}
	public hasDerivedNode( col : GrobCollection<GrobDerivedNode> | string , name : string){
		return this.hasNode(derived,col,name);
	}
	public hasFixedNode( col : GrobCollection<GrobFixedNode> | string  , name : string){
		return this.hasNode(fixed,col,name);
	}
	



	// get Statements 
	public getCollection( group : groupKeyType , name : string){
		
		const grp = this._getGroup(group);
		if(!grp){
			this.out.outError(`No group existed by name ${group}`)
			return null;
		}

		const col = grp.getCollection(name) ;
		if(!col){
			this.out.outError(`attempted to get ${group} collection ${name}, but no collection existed by that name`);
			return null;
		}

		return col as GrobCollection<GrobNodeType> ;
	}
	public getDerivedCollection(name:string){
		return this.getCollection(derived,name) as  GrobCollection<GrobDerivedNode> ;
	}
	public getFixedCollection(name:string){
		return this.getCollection(fixed,name) as  GrobCollection<GrobFixedNode> ;
	}
	public getNode( group : groupKeyType , col : GrobCollection<GrobNodeType> | string , name : string){
		
		const grp = this._getGroup(group);
		if(!grp){
			this.out.outError(`No group existed by name ${group}`)
			return null;
		}
		
		// define output
		let node : GrobNodeType;

		// if this is a collection, just get the node.
		if ( typeof col !== 'string') {
			node = (col as  GrobCollection<GrobNodeType>).getNode(name);
		}
		
		// if col is a string, then let it be seen as the name of the collection, and fetch it.
		else {
			
			// get data
			col = grp.getCollection(col) as GrobCollection<GrobNodeType> ;
			
			// error handling.
			if( !col ){
				this.out.outError(`attempted to get derived collection ${name}, but did not exist`);
				return null;
			}

			// defined output
			node = col.getNode(name);
		}

		// error handling
		if ( !node ){
			this.out.outError(`attempted to get derived Node ${name}, but did not exist`);
			return null;
		}


		return node; 
	}
	public getDerivedNode( col : GrobCollection<GrobDerivedNode> | string , name : string){
		return this.getNode(derived,col,name ) as GrobDerivedNode;
		/*
		// define output
		let node : derivedNode;

		// if this is a collection, just get the node.
		if ( typeof col !== 'string') {
			node = (col as  Collection<derivedNode>).getNode(name);
		}
		
		// if col is a string, then let it be seen as the name of the collection, and fetch it.
		else {
			
			// get data
			col = this.derived.getCollection(col) as Collection<derivedNode> ;
			
			// error handling.
			if( !col ){
				this.out.outError(`attempted to get derived collection ${name}, but did not exist`);
				return null;
			}

			// defined output
			node = col.getNode(name);
		}

		// error handling
		if ( !node ){
			this.out.outError(`attempted to get derived Node ${name}, but did not exist`);
			return null;
		}


		return node;*/
	}
	public getFixedNode( col : GrobCollection<GrobFixedNode> | string  , name : string){
		return this.getNode(fixed,col,name ) as GrobFixedNode;
		/*
			// define output
			let node : fixedNode;

			// if this is a collection, just get the node.
			if ( typeof col !== 'string') {
				node = (col as  Collection<fixedNode>).getNode(name);
			}
			
			// if col is a string, then let it be seen as the name of the collection, and fetch it.
			else {
				
				// get data
				col = this.fixed.getCollection(col) as Collection<fixedNode> ;
				
				// error handling.
				if( !col ){
					this.out.outError(`attempted to get fixed collection ${name}, but did not exist`);
					return null;
				}
	
				// defined output
				node = col.getNode(name);
			}
	
			// error handling
			if ( !node ){
				this.out.outError(`attempted to get fixed Node ${name}, but did not exist`);
				return null;
			}
	
	
			return node;
			*/
	}

	// delete Statements 
	protected _deleteGroup		(group:GrobGroupType | string ){

		if(typeof group == 'string'){
			const name = group;
			group = this._getGroup(group) as GrobGroupType;
			if(!group){
				this.out.outError('No Collection by name ' + name);
				return false;
			}
		}

		if(group.getName() == 'fixed' ){
			// @ts-ignore
			this.fixed = null;
			this.fixedKey = null;
		}

		if(group.getName() == 'derived' ){
			// @ts-ignore
			this.derived = null;
			this.derivedKey = null;
		}

		super._deleteGroup(group);
	}
	public deleteCollection( group : groupKeyType , col : string | GrobCollection<GrobNodeType>){
		const grp = this._getGroup(group);
		if(!grp){
			this.out.outError(`No group existed by name ${group}`)
			return false;
		}

		if(typeof col === 'string'){
			col =
			col = grp.getCollection(col) as GrobCollection<GrobNodeType>;
			if(!col)
				return false;
		}
	
		return this._deleteCollection(col);
	}
	public deleteDerivedCollection(col:string | GrobCollection<GrobDerivedNode>| string ){
		return this.deleteCollection(derived,col)
	}
	public deleteFixedCollection(col:string | GrobCollection<GrobFixedNode> ){
		return this.deleteCollection(fixed,col)
	}
	public deleteNode( group : groupKeyType , col : GrobCollection<GrobNodeType> | string , name : string){
		
		const grp = this._getGroup(group);
		if(!grp){
			this.out.outError(`No group existed by name ${group}`)
			return false;
		}

		if( typeof col === 'string'){
			col = grp.getCollection(col) as GrobCollection<GrobDerivedNode>;
		}
		if(!col){
			this.out.outError(`attempted to get ${group} collection ${name}, but no collection existed by that name`);
			return false;
		}

		
		let node = col.getNode(name);
		return col.removeNode(node);
	}
	public deleteDerivedNode( col : GrobCollection<GrobDerivedNode> | string , name : string){
		return this.deleteNode(derived,col,name);
	}
	public deleteFixedNode( col : GrobCollection<GrobFixedNode> | string  , name : string){
		return this.deleteNode(fixed,col,name);
	}


	protected _getGroup( name ){
		switch(name){
			case derived:
				return this._getGroup_key(this.derivedKey);
			case fixed:
				return this._getGroup_key(this.fixedKey);
		}
		return null;
	}

	
	// add dependency
	public addNodeDependency(node : GrobDerivedNode, dep : GrobNodeType){
		this._addNodeDependency(node,dep);
	}
	public removeNodeDependency(node:GrobDerivedNode, dep:GrobNodeType){
		this._removeNodeDependency(node,dep);
	}
	

}