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
	
}