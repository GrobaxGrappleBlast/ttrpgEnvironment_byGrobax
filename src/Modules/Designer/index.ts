


import { TTRPGSystemGraphModel, type groupKeyType } from './GraphV2/TTRPGSystemGraphModel';
import type { GrobNodeType } from './GraphV2/TTRPGSystemsGraphDependencies';
import { GrobCollection, type GrobCollectionType } from './GrobCollection';
import { GrobGroup, type GrobGroupType } from './GrobGroup';
import { GrobDerivedNode, GrobDerivedOrigin, GrobFixedNode } from './GrobNodte';
 
	/*
	abstract class DerivedNode {
		public abstract addDependent(node: NodeType ) : boolean ;
		public abstract removeDependent(node:NodeType) : boolean;
		public abstract getDependents(): NodeType[] ;
		public abstract getDependencies(): NodeType[] ;
		public abstract addDependency( node:NodeType) : boolean ;
		public abstract removeDependency( node:NodeType)  : boolean;
		public abstract nullifyDependency( node:NodeType ): boolean;
		public abstract nullifyDependent(node:NodeType) : boolean;
		public abstract getValue() : number 
		public abstract setName( name ) : void;
		public abstract getLocationKey() : string;
		public abstract getLocationKeySegments() : string []  ;
		public abstract isValid() : boolean ;
		public abstract update( ): boolean ;

		// derived Specifik
		public abstract setCalc ( calc , updateOrigins? );
		public abstract testCalculate( statement ) : any ;
		public abstract setOrigin( symbol, node : NodeType , standardValue? : number )

	}
	abstract class DerivedOrigin {
		public abstract symbol: string;
		public abstract standardValue:number;
		public abstract origin: NodeType | null;
	}
	abstract class FixedNode {
		public abstract addDependent(node: NodeType ) : boolean ;
		public abstract removeDependent(node:NodeType) : boolean;
		public abstract getDependents(): NodeType[] ;
		public abstract getDependencies(): NodeType[] ;
		public abstract addDependency( node:NodeType) : boolean ;
		public abstract removeDependency( node:NodeType)  : boolean;
		public abstract nullifyDependency( node:NodeType ): boolean;
		public abstract nullifyDependent(node:NodeType) : boolean;
		public abstract getValue() : number 
		public abstract setName( name ) : void;
		public abstract getLocationKey() : string;
		public abstract getLocationKeySegments() : string []  ;
		public abstract isValid() : boolean ;
		public abstract update( ): boolean ;
	}

	type NodeType = DerivedNode | FixedNode; 
	type GraphCollectioType = GraphCollection<NodeType>
	abstract class GraphCollection<T extends NodeType> {
		public abstract hasNode(name) ;
		public abstract getNode(name): T ;
		public abstract addNode(node: T);
		public abstract removeNode(node : T);
		public abstract update_node_name(oldName,newName);
		public abstract setName( name );
	}

	type GraphGroupType = GraphGroup<NodeType>
	type GraphGraphTypeString = 'derived' | 'fixed';
	abstract class GraphGroup<T extends NodeType> {
		public abstract hasCollection(name) 
		public abstract getCollection(name) 
		public abstract addCollection(collection: GraphCollection<T>) 
		public abstract removeCollection( collection : GraphCollection<T> )
		public abstract update_collection_name(oldName,newName)
	}

	abstract class TTRPGSystem{

		public constructor(){}

		/// Create Statements 
		public abstract createCollection( group : GraphGraphTypeString | GraphGroupType , name : string) : GraphCollectioType 
		public abstract createDerivedCollection( name : string): GraphCollection<DerivedNode> 
		public abstract createFixedCollection(name : string) : GraphCollection<FixedNode>
		public abstract createNode( group : GraphGraphTypeString | GraphGroupType ,col : GraphCollection<NodeType> | string , name : string) :NodeType
		public abstract createDerivedNode( col : GraphCollection<DerivedNode> | string , name : string) : DerivedNode
		public abstract createFixedNode( col : GraphCollection<FixedNode> | string  , name : string) : FixedNode

		// has Statements 
		public abstract hasCollection( group : GraphGraphTypeString | GraphGroupType , name : string): boolean
		public abstract hasDerivedCollection(name:string): boolean
		public abstract hasFixedCollection(name:string): boolean
		public abstract hasNode( group : GraphGraphTypeString | GraphGroupType , col : GraphCollection<NodeType> | string , name : string): boolean
		public abstract hasDerivedNode( col : GraphCollection<DerivedNode> | string , name : string): boolean
		public abstract hasFixedNode( col : GraphCollection<FixedNode> | string  , name : string) : boolean
		

		// get Statements 
		public abstract getCollection( group : groupKeyType | GraphGroupType, name : string): GraphCollection<NodeType> 
		public abstract getDerivedCollection(name:string) : GraphCollection<DerivedNode> 
		public abstract getFixedCollection(name:string) : GraphCollection<FixedNode> 
		public abstract getNode( group : groupKeyType , col : GraphCollection<NodeType> | string , name : string) :NodeType
		public abstract getDerivedNode( col : GraphCollection<DerivedNode> | string , name : string) : DerivedNode
		public abstract getFixedNode( col : GraphCollection<FixedNode> | string  , name : string) :FixedNode

		// delete Statements 
		public abstract deleteCollection( group : groupKeyType | GraphGroupType , col : string | GraphCollection<NodeType>) : boolean
		public abstract deleteDerivedCollection(col:string | GraphCollection<DerivedNode>| string ) : boolean
		public abstract deleteFixedCollection(col:string | GraphCollection<FixedNode> ) : boolean
		public abstract deleteNode( group : groupKeyType | GraphGroupType , col : GraphCollection<NodeType> | string , name : string) : boolean
		public abstract deleteDerivedNode( col : GraphCollection<DerivedNode> | string , name : string) : boolean
		public abstract deleteFixedNode( col : GraphCollection<FixedNode> | string  , name : string) : boolean
		
		public abstract addNodeDependency(node : DerivedNode, dep : NodeType) : boolean
		public abstract removeNodeDependency(node:DerivedNode, dep:NodeType) : boolean
		
	}
	*/
 
	export { 
		TTRPGSystemGraphModel as TTRPGSystem,
		GrobFixedNode		,
		GrobDerivedNode		,
		GrobDerivedOrigin	,
		GrobGroup			,
		GrobCollection		,
		GrobCollectionType	,
		GrobGroupType		,
		GrobNodeType		,
		groupKeyType
	}
	
 