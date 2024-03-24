import { Collection } from "../Designer/Collection";
import { Group } from "../Designer/Group";
import type { IOutputHandler } from "../Designer/Abstractions/IOutputHandler";
import { Nodte, derivedNode, fixedNode } from "../Designer/Nodte";


 
export type typeSystemKeys = keyof ABaseAccess_System; 

/**
 * handles Base Operations and Data
 * and that errors cannot happen
*/
export abstract class ABaseAccess_System {
 
	fixed	: Group<fixedNode>		= new Group('fixed'		, fixedNode );
	derived	: Group<derivedNode>	= new Group('derived'	, derivedNode );

	public isOfTypeASystemKeys(value) {
		return ['fixed','derived'].includes(value);
	}

	protected _hasGroup(groupKey: typeSystemKeys): boolean {
		return (this[groupKey] ?? false) ? true : false;
	}
	protected _hasCollection(groupKey: typeSystemKeys, colKey: string): boolean {
		return this._getGroup(groupKey).hasCollection(colKey) ?? false;
	}
	protected _hasNode(groupKey: typeSystemKeys, colKey: string, nodeKey: string): boolean {
		return this._getCollection(groupKey,colKey)?.hasNode(nodeKey) ?? false;
	}

	protected _getGroup(groupKey: typeSystemKeys) : Group<fixedNode | derivedNode> {
		return this[groupKey] as Group<fixedNode | derivedNode>;
	}
	protected _getCollection(groupKey: typeSystemKeys, colKey: string) : Collection<fixedNode | derivedNode> {
		return this._getGroup(groupKey)?.getCollection(colKey) ?? null;
	}
	protected _getNode(groupKey: typeSystemKeys, colKey: string, nodeKey: string) : fixedNode | derivedNode {
		return this._getCollection(groupKey, colKey).getNode(nodeKey) ;
	}
 
	protected _createCollection(groupKey:typeSystemKeys , colKey:string, out: IOutputHandler )														{
		let newCol = new Collection<fixedNode | derivedNode>(colKey);
		return newCol;
	}

	protected _createNode(groupKey: typeSystemKeys, colKey: string, nodeKey: string, out: IOutputHandler) 											{
		
		// Create the new node.
		let newNode = (this[groupKey] as Group<any>).createNewNodeInstance(nodeKey);
		return newNode;

	}
	 
}