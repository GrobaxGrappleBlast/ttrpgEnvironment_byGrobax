import { Collection } from "../Designer/Collection";
import { Group } from "../Designer/Group";
import type { IOutputHandler } from "../Designer/IOutputHandler";
import { Nodte, derivedNode, fixedNode } from "../Designer/Nodte";
import { type typeSystemKeys } from "./A01BaseAccess_System";
import { AHiarchy_system } from "./A02Hiarchy_system";

/**
 * Handles Graph Links 
 * asummes higher levels does not exists, and that errors cannot happen
 */
export abstract class AGraph_System extends AHiarchy_system {

	// this here is an access point for a single Nodes, Who it depends apon
	public dependencyGraph_outgoing : Record< string , Nodte<any>[] > = {}

	// this here is an access point for a single Nodes, Who depends on this
	public dependencyGraph_ingoing  : Record< string , Nodte<any>[] > = {}



	protected _deleteCollection(groupKey:typeSystemKeys , colKey:string, out: IOutputHandler )													{ return super._deleteCollection	(groupKey , colKey , out )	}
	protected _updateCollection(groupKey:typeSystemKeys , colKey:string, col:Collection<any>, out: IOutputHandler )								{ return super._updateCollection	(groupKey , colKey , col , out )	}
	protected _createCollection(groupKey:typeSystemKeys , colKey:string, out: IOutputHandler )													{ 
		const collection =  super._createCollection	(groupKey , colKey , out );
		return collection	
	}
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
