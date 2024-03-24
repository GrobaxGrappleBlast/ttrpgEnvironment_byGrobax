import { Collection } from "../Designer/Collection";
import { Group } from "../Designer/Group";
import type { IOutputHandler } from "../Designer/Abstractions/IOutputHandler";
import { Nodte, derivedNode, fixedNode, type NodeType } from "../Designer/Nodte";
import { ABaseAccess_System, type typeSystemKeys } from "./A01BaseAccess_System";
/**
* handles Hiarchy Maintainance. 
* asummes higher levels does not exists, and that errors cannot happen
 */
export abstract class AHiarchy_system extends ABaseAccess_System {
	protected _deleteCollection(groupKey:typeSystemKeys , colKey:string, out: IOutputHandler )													{ return super._deleteCollection	(groupKey , colKey , out )	}
	protected _updateCollection(groupKey:typeSystemKeys , colKey:string, col:Collection<any>, out: IOutputHandler ){ 
		// first Create a new Collection Key.

		// get all Nodes in this connection
			// foreach node. create a new complete key for them
			
			


	}
	protected _createCollection(groupKey:typeSystemKeys , colKey:string, out: IOutputHandler )													{ 
		
		let group = this._getGroup(groupKey);
		let col = super._createCollection	(groupKey , colKey , out )	;
		group.addCollection(col);

		col.parent = group;
		return col;
	}
	protected _createNode(groupKey: typeSystemKeys, colKey: string, nodeKey: string, out: IOutputHandler) 										{ 
		
		// get collection, create node, add node to collection;
		let col = this._getCollection(groupKey,colKey);
		let newNode = super._createNode			(groupKey , colKey , nodeKey , out );
		col.addNode(newNode);

		return newNode;
	}
	protected _updateNode(oldGroupKey: typeSystemKeys, oldCollectionKey: string, oldNodeKey: string, nodeobj: NodeType , out: IOutputHandler ) { 
		  
		// update Derived Collection to link to the new object
		let collection = this._getCollection(oldGroupKey, oldCollectionKey);
		collection.deleteNode( oldNodeKey )
		collection.addNode( nodeobj ) 

		nodeobj.parent = collection;
		return nodeobj;
	}
	protected _deleteNode(groupKey: typeSystemKeys, collectionKey: string, nodeKey: string, out: IOutputHandler ){ 
		 
	} 
}