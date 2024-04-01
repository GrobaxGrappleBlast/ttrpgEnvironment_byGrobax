import type { groupKeyType } from "../GraphV2/TTRPGSystemGraphModel";
import type { IGrobCollection } from "./IGrobCollection";
import type { IGrobDerivedNode, IGrobFixedNode, IGrobNode } from "./IGrobNode";

  
/**
 *  handles Model operations and Data Containment, 
 * Ensures that data is maintained, as well as graphlinks
*/
export interface ITTRPGSystem {
	 
	/// Create Statements 
	createCollection( group : groupKeyType , name : string)
	createDerivedCollection( name : string) 
	createFixedCollection(name : string) 
	createNode( group : groupKeyType ,col : IGrobCollection<IGrobNode> | string , name : string) 
	createDerivedNode( col : IGrobCollection<IGrobDerivedNode> | string , name : string)
	createFixedNode( col : IGrobCollection<IGrobFixedNode> | string  , name : string) 



	// has Statements 
	hasCollection( group : groupKeyType , name : string) 
	hasDerivedCollection(name:string) 
	hasFixedCollection(name:string) 
	hasNode( group : groupKeyType , col : IGrobCollection<IGrobNode> | string , name : string) 
	hasDerivedNode( col : IGrobCollection<IGrobDerivedNode> | string , name : string) 
	hasFixedNode( col : IGrobCollection<IGrobFixedNode> | string  , name : string) 


	// get Statements 
	getCollection( group : groupKeyType , name : string) 
	getDerivedCollection(name:string) 
	getFixedCollection(name:string)
	getNode( group : groupKeyType , col : IGrobCollection<IGrobNode> | string , name : string) 
	getDerivedNode( col : IGrobCollection<IGrobDerivedNode> | string , name : string) 
	getFixedNode( col : IGrobCollection<IGrobFixedNode> | string  , name : string) 

	// delete Statements 
	deleteCollection( group : groupKeyType , col : string | IGrobCollection<IGrobNode>) 
	deleteDerivedCollection(col:string | IGrobCollection<IGrobDerivedNode>| string ) 
	deleteFixedCollection(col:string | IGrobCollection<IGrobFixedNode> ) 
	deleteNode( group : groupKeyType , col : IGrobCollection<IGrobNode> | string , name : string) 
	deleteDerivedNode( col : IGrobCollection<IGrobDerivedNode> | string , name : string) 
	deleteFixedNode( col : IGrobCollection<IGrobFixedNode> | string  , name : string) 
 

	// add dependency
	addNodeDependency(node : IGrobDerivedNode, dep : IGrobNode) 
	removeNodeDependency(node:IGrobDerivedNode, dep:IGrobNode) 
}