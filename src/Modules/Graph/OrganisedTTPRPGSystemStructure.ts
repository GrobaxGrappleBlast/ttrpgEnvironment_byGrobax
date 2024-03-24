import { Collection } from "../Designer/Collection";
import { Group } from "../Designer/Group";
import { derivedNode, fixedNode } from "../Designer/Nodte";
import type { typeSystemKeys } from "./A01BaseAccess_System";
import { AValidCheck_system } from "./A04ValidCheck_system";


/**
 * An overall container that contains Grous > Collections > Nodtes ( of different kinds )
 * Manages their maintainanace as well as links and General Data. 
 */
export class OrganisedTTPRPGSystemStructure  extends AValidCheck_system  {
 
	public static getInstance(){
		if(OrganisedTTPRPGSystemStructure._instance == null){
			OrganisedTTPRPGSystemStructure._instance = new OrganisedTTPRPGSystemStructure();
		}
		return OrganisedTTPRPGSystemStructure._instance;
	}
	private static _instance : OrganisedTTPRPGSystemStructure;


	public hasNode(groupKey: typeSystemKeys, colKey: string, nodeKey: string): boolean {
		return this.hasNode(groupKey,colKey,nodeKey);
	}
	public getGroup(groupKey: typeSystemKeys) : Group<fixedNode | derivedNode> {
		return this._getGroup(groupKey);
	}
	public getCollection(groupKey: typeSystemKeys, colKey: string) : Collection<fixedNode | derivedNode> {
		return this._getCollection(groupKey,colKey)
	}

	
}