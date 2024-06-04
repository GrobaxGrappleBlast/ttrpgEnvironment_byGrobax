import { GrobCollection } from "../GrobCollection";
import { type GrobGroupType } from "../GrobGroup";
import { newOutputHandler } from "../Abstractions/IOutputHandler"; 
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

	public constructor(){
		super();
		this.setOut( newOutputHandler() );
	}

	//TODO : find better solution than this.
	// r 
	public initAsNew(){
		this._createGroup( 'fixed' )	;
		this._createGroup( 'derived' )	;
	}


	/// Create Statements 
	public createCollection( group : groupKeyType , name : string){
		
		// ensure that group exists, same way as the others
		if(!this._hasGroup(group)){
			this.out.outError(`No group existed by name ${group}`)
		}
		
		let grp : GrobGroupType | null = this._getGroup(group);
		if(!grp)
			return null;

		return this._createCollection( grp , name);
	}
	public createDerivedCollection( name : string) : GrobCollection<GrobDerivedNode>{
		return this.createCollection(derived, name) as  GrobCollection<GrobDerivedNode>;
	}
	public createFixedCollection(name : string) : GrobCollection<GrobFixedNode> {
		return this.createCollection(fixed, name) as GrobCollection<GrobFixedNode> ;
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
	public createDerivedNode( col : GrobCollection<GrobDerivedNode> | string , name : string) : GrobDerivedNode | null{
		
		let colName = col;
		if( typeof col == 'string'){
			let grp = this._getGroup(derived);
			if(!grp)
				return null;
			col = grp.getCollection(col) as GrobCollection<GrobDerivedNode> ;
		}else{
			colName = col.getName();
		}

	 
		if(!col){
			this.out.outError(`No Derived collection found by name: ${colName} `);
			return null;
		}

		const node = new GrobDerivedNode(name,col);
		col.addNode(node); 
		return node as GrobDerivedNode;
	}
	public createFixedNode( col : GrobCollection<GrobFixedNode> | string  , name : string){
		
		let grp = this._getGroup(fixed);
		if(!grp)
			return null;

		let colName = col;
		if( typeof col !== 'string'){
			// @ts-ignore
			colName = col.getName();
		}
		else{
			col = grp.getCollection(colName) as GrobCollection<GrobFixedNode>;
		}

		if(!col){
			this.out.outError(`No Fixed collection found by name: ${colName} `);
			return null;
		}

		const node = new GrobFixedNode(name,col);
		col.addNode(node); 

	}



	// has Statements 
	public hasCollection( group : groupKeyType , name : string):boolean{
		
		const grp = this._getGroup(group);
		if(!grp){
			this.out.outError(`No group existed by name ${group}`)
			return false;
		}

		return grp.hasCollection(name) ;
	}
	public hasDerivedCollection(name:string):boolean{
		return this.hasCollection(derived,name);
	}
	public hasFixedCollection(name:string):boolean{
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
			_col = this.getCollection(grp,col); 
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
	public getCollection( group : groupKeyType | GrobGroupType, name : string){
		
		let grp : GrobGroupType;
		if( typeof group == 'string'){
			grp = this._getGroup(group) as GrobGroupType;
		}else{
			grp = group;
		}

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
			const colName = col;
			col = grp.getCollection(col) as GrobCollection<GrobNodeType> ;
			
			// error handling.
			if( !col ){
				this.out.outError(`attempted to get ${group} collection ${colName}, but did not exist`);
				return null;
			}

			// defined output
			node = col.getNode(name);
		}

		// error handling
		if ( !node ){
			this.out.outError(`attempted to get ${group}.${col.getName()} Node ${name}, but did not exist`);
			return null;
		}


		return node; 
	}
	public getDerivedNode( col : GrobCollection<GrobDerivedNode> | string , name : string){
		return this.getNode(derived,col,name ) as GrobDerivedNode;
	}
	public getFixedNode( col : GrobCollection<GrobFixedNode> | string  , name : string){
		return this.getNode(fixed,col,name ) as GrobFixedNode;

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


	// Renaming functions
	public renameCollection	   (  group : groupKeyType | GrobGroupType , col : GrobCollection<GrobNodeType> | string , newName:string ){
		
		// check that group exists, and get the values. 
		let grp : GrobGroupType;
		let grpName;
		if( typeof group == 'string'){
			grpName = group;
			grp = this._getGroup(group) as GrobGroupType;
		}else{
			grpName = group.getName();
			grp = group;
		}

		if(!grp){
			this.out.outError(`No group existed by name ${grpName}`)
			return null;
		}

		// Check that Collection exists and get the values 
		let colName = col;
		if ( typeof col == 'string') {
			colName = col;
			col = grp.getCollection(col);
		} else {
			colName = col.getName();
		}
		
		if (!col) {
			this.out.outError(`No Collection existed by name ${ colName } in ${grpName}`)
			return null;
		}

		// update 
		return grp.update_collection_name(colName,newName);
	}
	public renameItem	   (  group : groupKeyType | GrobGroupType , col : GrobCollection<GrobNodeType> | string , oldName:string ,newName:string ){
		
		// check that group exists, and get the values. 
		let grp : GrobGroupType;
		let grpName;
		if( typeof group == 'string'){
			grpName = group;
			grp = this._getGroup(group) as GrobGroupType;
		}else{
			grpName = group.getName();
			grp = group;
		}

		if(!grp){
			this.out.outError(`No group existed by name ${grpName}`)
			return null;
		}

		// Check that Collection exists and get the values 
		let colName = col;
		if ( typeof col == 'string') {
			colName = col;
			col = grp.getCollection(col);
		} else {
			colName = col.getName();
		}
		
		if (!col) {
			this.out.outError(`No Collection existed by name ${ colName } in ${grpName}`)
			return null;
		}
		

		// check that the Node exists
		if( !col.hasNode(oldName) ){
			this.out.outError(`No Item existed by name ${ oldName } in ${grpName}.${colName}`)
			return null;
		}

		// update 
		return col.update_node_name(oldName,newName);
	}

	// Validation Functions
	public isValid ( errorMessages : {msg:string, key:string[]}[] = []){

		let key_group,key_collection,key_node;
		let collectionNames, nodeNames;
		let group,collection,node; 
		let isValid;

		// foreach group, get do this for all collections.
		for ( key_group in this.data ){
			group = this.data[key_group];
			collectionNames =  group.getCollectionsNames();

			// forach collection do this for all nodes 
			for ( const colIndex in group.getCollectionsNames() ){
				key_collection = collectionNames[colIndex];
				collection = group.getCollection(key_collection);
				nodeNames = collection.getNodeNames();

				// do this for each node. 
				for ( const nodeIndex in nodeNames ){
					key_node = nodeNames[nodeIndex]
					node	= collection.getNode(key_node);

					isValid	= node.isValid();
					if(!isValid){
						let msg = `${key_group}.${key_collection}.${key_node} was invalid`;
						let keys = [key_group , key_collection , key_node];
						errorMessages.push({msg:msg, key:keys});
					}
				}
			}
		}
		return errorMessages.length == 0;
	} 
	protected _getGroup( name ){
		let grp = this.data[name]
		return grp ?? null ;
	}

	
	// add dependency
	public addNodeDependency(node : GrobDerivedNode, dep : GrobNodeType){
		this._addNodeDependency(node,dep);
	}
	public removeNodeDependency(node:GrobDerivedNode, dep:GrobNodeType){
		this._removeNodeDependency(node,dep);
	}
}