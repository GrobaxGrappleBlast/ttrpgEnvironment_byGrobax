import type { GrobNodeType } from "../GraphV2/TTRPGSystemsGraphDependencies"

export interface IFixedNode {
	addDependency(node:GrobNodeType) : boolean   
	removeDependency(node:GrobNodeType) : boolean  

	addDependent(node: GrobNodeType ) : boolean  
	removeDependent(node:GrobNodeType) : boolean 
}