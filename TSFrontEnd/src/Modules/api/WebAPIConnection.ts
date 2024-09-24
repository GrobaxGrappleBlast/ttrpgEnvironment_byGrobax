import { JSONHandler } from "grobax-json-handler"; 
import { APIReturnModel, IAPI } from "./IAPI";
import { SystemPreview } from "../core/model/systemPreview";

export interface Message{
	msg	:string;
	type:string;
}


class Server{
	
	// TODO: get the url from a configuration 
	public static baseUrl : string = "http://localhost:5000";


	private static async call( call : 'GET' | 'POST' | 'PUT' | 'DELETE', url , _object? ){
	 
		if (_object){
			var response = await fetch( Server.baseUrl +"/"+url ,{
					method: call,
					headers:{
						'Content-Type': 'application/json'
					},
					body: typeof _object == 'string' ? _object : JSON.stringify( _object )
				}
			);
		}
		else{
			var response = await fetch( Server.baseUrl +"/"+url ,{
					method: call,
					headers:{
						'Content-Type': 'application/json'
					}
				}
			);
		}
		return response;
	}

	public static async post(url, json ){
		return await Server.call('POST',url,json);
	}
	public static async get(url){
		return await Server.call('GET',url);
	}
	public static async delete(url, json ){
		return await Server.call('DELETE',url, json);
	}
	public static async put(url, json  ){
		return await Server.call('PUT',url, json);
	}

}

export class WebApiConnection implements IAPI{
	public async getAllSystems() : Promise<APIReturnModel<SystemPreview[]>>{
	
		let serverResp = await Server.get("api/system");
		
		if(serverResp.status == 200){

			let json = await serverResp.text();
			let objs : SystemPreview[] = JSONHandler.deserialize(SystemPreview,json);
			let response = {
				responseCode : serverResp.status,
				messages : [serverResp.statusText],
				response: objs
			} as APIReturnModel<SystemPreview[]>
			return response;
		} else {
			let response = {
				responseCode : serverResp.status,
				messages : [serverResp.statusText],
				response: []
			} as APIReturnModel<SystemPreview[]>
			return response;
		} 
	}
}