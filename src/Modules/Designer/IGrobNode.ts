import { GrobDerivedOrigin } from "./GrobNodte";

export interface IGrobNode { 
	addDependent(node: IGrobNode) : boolean ;
	removeDependent(node: IGrobNode) : boolean ;
	getDependents():IGrobNode[]; 
	removeDependency(node:IGrobNode)
	getDependencies():IGrobNode; 
	getValue() : number ; 
	getLocationKey():string;
	getLocationKeySegments():string[];
	getTypeString():string;
}

export interface IGrobFixedNode extends IGrobNode{
	setValue():boolean;
}

export interface IGrobDerivedNode extends IGrobNode{
	setCalc( calc ):boolean;
	testCalculate( statement, useTempValues : boolean | null ): number | null;
	testParseCalculation( calc ,  origins : GrobDerivedOrigin[] | null ) : GrobDerivedOrigin[]; 
	addOriginDependency(symbol:string, dep:IGrobNode):boolean;
}



