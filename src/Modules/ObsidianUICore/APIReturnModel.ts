import type { Message } from "../ObsidianUI/UIInterfaces/Designer01/BaseComponents/Messages/message";

/**
 * Apireturn model mimics a http Call. the class is used by the API, in the work of seperating logic from ui-logic
 * @template T 
 * @member responseCode mimics a http response code 
 * @member messages extra messages with keys for each message object. 
 * @member response The Actual response model. 
 */
export interface APIReturnModel<T> {
	responseCode : number;
	messages : Record<string, Message> ;
	response : T;
}