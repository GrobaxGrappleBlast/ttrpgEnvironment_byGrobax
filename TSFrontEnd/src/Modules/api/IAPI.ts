import { SystemPreview } from "../core/model/systemPreview";


/**
 * Apireturn model mimics a http Call. the class is used by the API, in the work of seperating logic from ui-logic
 * @template T 
 * @member responseCode mimics a http response code 
 * @member messages extra messages with keys for each message object. 
 * @member response The Actual response model. 
 */
export interface APIReturnModel<T> {
	responseCode : number;
	messages : string[];
	response : T;
}

export interface IAPI{
	getAllSystems() : Promise<APIReturnModel<SystemPreview[]>>;

	getSystemUIs( preview : SystemPreview );

	getFactory( preview : SystemPreview );
}