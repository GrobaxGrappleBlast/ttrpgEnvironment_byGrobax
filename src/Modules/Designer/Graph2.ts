import type { IOutputHandler } from "./IOutputHandler";

/*
 
 
   /**
	* Updates node combined
	* @param oldCombinedKey 	a combined key, where every segment is seperated by a seperation icon ('.')
	* @param nodeobj 			the New Node data. to update this must not be the same object instance as the old.
	* @param out				*optional* intercept out messages, by interface. if null they are console logged and console error logged
	* @returns 				returns null or the new node that has been updated
    
   public updateNodeCombined( oldCombinedKey : string  , nodeobj : Nodte ,out : IOutputHandler ){
   	
	   // we ensure the out interface is used. 
	   if( out == null ){
		   out = this.out as IOutputHandler;
	   }

	   let keySegments = oldCombinedKey.split('.');
	   if(keySegments.length != 3){
		   out.outError('Key did not have 3 segments,')
		   return null;
	   }
 
	   return this.updateNode(keySegments[0], keySegments[1], keySegments[2] , nodeobj)
   }*/
class derived_node_origin {

}

type constructorMethod<T> = { new (...args: any[]): T };

abstract class Nodte<T extends Nodte<T>>{
	constructor(name) {
		this.name = name;
	}
	name: string
	parentCollection: Collection<T>;
	public static getTypeString(): string{
		return 'Nodte<T extends Nodte<T>>';
	}


}
class fixedNode extends Nodte<fixedNode>{

	public static  getTypeString(): string {
		return 'fixedNode';
	}


}
class derivedNode extends Nodte<derivedNode>{

	public static getTypeString(): string {
		return 'derivedNode';
	}
}

class Collection<T extends Nodte<T>>{
	constructor(name) {
		this.name = name;
	}
	name: string
	nodes: Record<string, T> = {}
	parentGroup: Group<T>;

	public hasNode(nodeName) {
		return this.nodes[nodeName] ? true : false;
	}
	public getNode(nodeName): T | undefined {
		return this.nodes[nodeName];
	}
	public addNode(node: T) {
		node.parentCollection = this;
		this.nodes[node.name] = node;
		return true;
	}

}
class Group<T extends Nodte<T>>{
	
	private TName : string;
	private TConstructor: constructorMethod<T>;
	constructor(name, generic : constructorMethod<T> ) {
		this.name = name;
		this.TName = generic.name;
		this.TConstructor = generic;
	}
	name: string
	collections: Record<string, Collection<T>>;
	public hasCollection(colName) {
		return this.collections[colName] ? true : false;
	}
	public getCollection(colName) {
		return this.collections[colName];
	}
	public addCollection(collection: Collection<T>) {
		collection.parentGroup = this;
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



// handles Base Operations and Data
//, and that errors cannot happen
abstract class ABaseAccess_System {

	fixed	: Group<fixedNode>		= new Group('fixed'		, fixedNode );
	derived	: Group<derivedNode>	= new Group('derived'	, derivedNode );

	public isOfTypeASystemKeys(value) {
		return Object.keys(ABaseAccess_System).includes(value);
	}

	protected _hasGroup(groupKey: typeSystemKeys): boolean {
		return this[groupKey] ? true : false;
	}
	protected _hasCollection(groupKey: typeSystemKeys, colKey: string): boolean {
		return this[groupKey]?.hasCollection(colKey) ?? false;
	}
	protected _hasNode(groupKey: typeSystemKeys, colKey: string, nodeKey: string): boolean {
		return this[groupKey]?.hasNode(nodeKey) ?? false;
	}

	protected _getGroup(groupKey: typeSystemKeys) {
		if (!this._hasGroup(groupKey)) {
			return null;
		}
		return this[groupKey] as Group<fixedNode | derivedNode>;
	}
	protected _getCollection(groupKey: typeSystemKeys, colKey: string) {
		return this._getGroup(groupKey)?.getCollection(colKey) ?? null;
	}
	protected _getNode(groupKey: typeSystemKeys, colKey: string, nodeKey: string) {
		return this._getCollection(groupKey, colKey)?.getNode(nodeKey) ?? null;
	}

	protected _deleteCollection(groupKey:typeSystemKeys , colKey:string, out: IOutputHandler )														{}
	protected _updateCollection(groupKey:typeSystemKeys , colKey:string, col:Collection<any>, out: IOutputHandler )									{}
	protected _createCollection(groupKey:typeSystemKeys , colKey:string, out: IOutputHandler )														{}

	/** 
	 * This creates a node of the correct type according to collection. 
	 * @return Node, of correct type.
	*/
	protected _createNode(groupKey: typeSystemKeys, colKey: string, nodeKey: string, out: IOutputHandler) 											{
		
		// Create the new node.
		let newNode = (this[groupKey] as Group<any>).createNewNodeInstance(nodeKey);
		return newNode;

	}
	protected _updateNode(oldGroupKey: typeSystemKeys, oldCollectionKey: string, oldNodeKey: string, nodeobj: Nodte<any>, out: IOutputHandler ) 	{}
	protected _deleteNode(groupKey: typeSystemKeys, collectionKey: string, nodeKey: string, out: IOutputHandler ) 									{}


}
type typeSystemKeys = keyof typeof ABaseAccess_System;


// handles Hiarchy Maintainance. 
// asummes higher levels does not exists, and that errors cannot happen
abstract class AHiarchy_system extends ABaseAccess_System {
	protected _deleteCollection(groupKey:typeSystemKeys , colKey:string, out: IOutputHandler )													{ return super._deleteCollection	(groupKey , colKey , out )	}
	protected _updateCollection(groupKey:typeSystemKeys , colKey:string, col:Collection<any>, out: IOutputHandler )								{ return super._updateCollection	(groupKey , colKey , col , out )	}
	protected _createCollection(groupKey:typeSystemKeys , colKey:string, out: IOutputHandler )													{ return super._createCollection	(groupKey , colKey , out )	}
	protected _createNode(groupKey: typeSystemKeys, colKey: string, nodeKey: string, out: IOutputHandler) 										{ 
		
		// get collection, create node, add node to collection;
		let col = this[groupKey].getCollection(colKey) as Collection<any>;
		let newNode = super._createNode			(groupKey , colKey , nodeKey , out );
		col.addNode(newNode);

		return newNode;
	}
	protected _updateNode(oldGroupKey: typeSystemKeys, oldCollectionKey: string, oldNodeKey: string, nodeobj: Nodte<any>, out: IOutputHandler ) { return super._updateNode			(oldGroupKey , oldCollectionKey , oldNodeKey, nodeobj, out )	}
	protected _deleteNode(groupKey: typeSystemKeys, collectionKey: string, nodeKey: string, out: IOutputHandler ) 								{ return super._deleteNode			(groupKey , collectionKey , nodeKey ,out )	} 
}


// Handles Graph Links 
// asummes higher levels does not exists, and that errors cannot happen
abstract class AGraph_System extends ABaseAccess_System {

	// this here is an access point for a single Nodes, Who it depends apon
	public dependencyGraph_outgoing : Record< string , Nodte<any>[] > = {}

	// this here is an access point for a single Nodes, Who depends on this
	public dependencyGraph_ingoing  : Record< string , Nodte<any>[] > = {}



	protected _deleteCollection(groupKey:typeSystemKeys , colKey:string, out: IOutputHandler )													{ return super._deleteCollection	(groupKey , colKey , out )	}
	protected _updateCollection(groupKey:typeSystemKeys , colKey:string, col:Collection<any>, out: IOutputHandler )								{ return super._updateCollection	(groupKey , colKey , col , out )	}
	protected _createCollection(groupKey:typeSystemKeys , colKey:string, out: IOutputHandler )													{ return super._createCollection	(groupKey , colKey , out )	}
	protected _createNode(groupKey: typeSystemKeys, colKey: string, nodeKey: string, out: IOutputHandler) {
		
		// create the node
		let newNode = super._createNode (groupKey , colKey , nodeKey , out ) ;

		// this node is not dependent on anyone. 
		this.dependencyGraph_outgoing[newNode.name] = [];

		return newNode;
	}
	protected _updateNode(oldGroupKey: typeSystemKeys, oldCollectionKey: string, oldNodeKey: string, nodeobj: Nodte<any>, out: IOutputHandler ) { return super._updateNode			(oldGroupKey , oldCollectionKey , oldNodeKey, nodeobj, out )	}
	protected _deleteNode(groupKey: typeSystemKeys, collectionKey: string, nodeKey: string, out: IOutputHandler ) 								{ return super._deleteNode			(groupKey , collectionKey , nodeKey ,out )	} 
}

// Handles Validation Checks, checks for whether or not an action can be performed
// asummes higher levels does not exists, and that errors Can only exists according to instance existances. 
abstract class AValidCheck_system extends AGraph_System {

	private nodeExistCheck(groupKey: string, colKey: string, nodeKey: string, out: IOutputHandler, outMsgAttachment: string = '') {

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(groupKey)) {
			out.outError(`${outMsgAttachment} groupKey Does ${groupKey} not exist on system`);
			return false;
		}

		// if everything is fine, no need to look for a good error message. 
		if (this._hasNode(groupKey as typeSystemKeys, colKey, nodeKey)) {
			return true;
		}

		// else figure out what is wrong and create the error message
		if (!this._hasGroup(groupKey as typeSystemKeys)) {
			out.outError(`${outMsgAttachment} groupKey Does not exist on system`);
		}
		else if (!this._hasCollection(groupKey as typeSystemKeys, colKey)) {
			out.outError(`${outMsgAttachment} CollectionKey ${colKey} Does not exist on group ${groupKey}`);
		}
		else {
			out.outError(`${outMsgAttachment} Node ${nodeKey} does not exists on ${groupKey}.${colKey}`);
		}
		return false;

	}

	private readonly out: IOutputHandler | null = {
		outError: function (msg: any) {
			console.error(msg);
		},
		outLog: function (msg: any) {
			console.log(msg)
		}
	}

	public createCollection(groupKey:string , colKey:string, out: IOutputHandler | null = null){
		// we ensure the out interface is used. 
		if (out == null) {
			out = this.out as IOutputHandler;
		}

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(groupKey)) {
			out.outError(`CREATE: groupKey Does ${groupKey} not exist on system`);
			return false;
		}
		let _groupkey = groupKey as typeSystemKeys;

		super._createCollection(_groupkey,colKey,out);
	}

	public createNode(groupKey: string, colKey: string, nodeKey: string, out: IOutputHandler | null = null) {

		// we ensure the out interface is used. 
		if (out == null) {
			out = this.out as IOutputHandler;
		}

		/// we do not use nodeExistCheck because we need it to do, all but check if the node exists, so this is custom 

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(groupKey)) {
			out.outError(`CREATE: groupKey Does ${groupKey} not exist on system`);
			return false;
		}
		let _groupkey = groupKey as typeSystemKeys;

		// ensure node does not exist
		if (this._hasNode(_groupkey, colKey, nodeKey)) {
			out.outError('CREATE: Node Already Exist, call update instead');
			return null;
		}
 
		if (!this._hasCollection(_groupkey, colKey)) {
			this.createCollection(_groupkey,colKey);	 
		}
		
		return super._createNode(_groupkey,colKey,nodeKey,out);
	}

	public updateNode(oldGroupKey: string, oldCollectionKey: string, oldNodeKey: string, nodeobj: Nodte<any>, out: IOutputHandler | null = null) {

		// we ensure the out interface is used. 
		if (out == null) {
			out = this.out as IOutputHandler;
		}

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(oldGroupKey)) {
			out.outError(`CREATE: groupKey Does ${oldGroupKey} not exist on system`);
			return false;
		}
		let _groupkey = oldGroupKey as typeSystemKeys;

		// check that the node exist
		if (!this.nodeExistCheck(oldGroupKey, oldCollectionKey, oldNodeKey, out, 'UPDATE:')) {
			return null;
		}
		
		super._updateNode(_groupkey,oldCollectionKey,oldNodeKey,nodeobj,out);
	}

	public deleteNode(groupKey: string, collectionKey: string, nodeKey: string, out: IOutputHandler | null = null) {

		// we ensure the out interface is used. 
		if (out == null) {
			out = this.out as IOutputHandler;
		}

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(groupKey)) {
			out.outError(`CREATE: groupKey Does ${groupKey} not exist on system`);
			return false;
		}
		let _groupkey = groupKey as typeSystemKeys;

		// check that the node exist
		if (!this.nodeExistCheck(groupKey, collectionKey, nodeKey, out, 'DELETE:')) {
			return null;
		}
		
		super._deleteNode(_groupkey,collectionKey,nodeKey,out);
	}

	public getNode(groupKey: string, collectionKey: string, nodeKey: string, out: IOutputHandler | null = null) {

		// we ensure the out interface is used. 
		if (out == null) {
			out = this.out as IOutputHandler;
		}

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(groupKey)) {
			out.outError(`CREATE: groupKey Does ${groupKey} not exist on system`);
			return false;
		}
		let _groupkey = groupKey as typeSystemKeys;

		// check that the node exist
		if (!this.nodeExistCheck(groupKey, collectionKey, nodeKey, out, 'GET:')) {
			return null;
		}

		return super._getNode(_groupkey, collectionKey, nodeKey );
	}
}