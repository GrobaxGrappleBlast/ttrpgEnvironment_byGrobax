import { GrobDerivedOrigin } from "../Designer/GrobNodte";
import type { GrobNodeType } from "../GraphV2/TTRPGSystemsGraphDependencies"

export interface IDerivedNode {
	calc:string;
	origins : GrobDerivedOrigin[];

	addDependency(node:GrobNodeType) : boolean   
	removeDependency(node:GrobNodeType) : boolean  

	addDependent(node: GrobNodeType ) : boolean  
	removeDependent(node:GrobNodeType) : boolean 
}