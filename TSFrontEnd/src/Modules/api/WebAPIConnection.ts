import { JSONHandler } from "grobax-json-handler"; 
import { APIReturnModel, IAPI } from "./IAPI";
import { SystemPreview } from "../core/model/systemPreview";
import { TTRPGSystemJSONFormatting } from "../graphDesigner";

export interface Message{
	msg	:string;
	type:string;
}


class ServerJson{

	private static async call( call : 'GET' | 'POST' | 'PUT' | 'DELETE', url , _object? ){
	 
		if (_object){
			var response = await fetch( Server.baseUrl +"/"+url ,{
					method: call,
					headers:{
						'Content-Type': 'application/json'
					},
					body: _object == 'string' ? _object : JSON.stringify( _object )
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
		return await ServerJson.call('POST',url,json);
	}
	public static async get(url){
		return await ServerJson.call('GET',url);
	}
	public static async delete(url, json ){
		return await ServerJson.call('DELETE',url, json);
	}
	public static async put(url, json  ){
		return await ServerJson.call('PUT',url, json);
	}
}
class ServerForm{

	private static async call( call : 'GET' | 'POST' | 'PUT' | 'DELETE', url , _object? ){
	 
		if (_object){
			var response = await fetch( Server.baseUrl +"/"+url ,{
					method: call,
					body: _object 
				}
			);
		}
		else{
			var response = await fetch( Server.baseUrl +"/"+url ,{
					method: call
				}
			);
		}
		return response;
	}

	public static async post(url, object ){
		return await ServerForm.call('POST',url,object);
	}
	public static async get(url){
		return await ServerForm.call('GET',url);
	}
	public static async delete(url, object ){
		return await ServerForm.call('DELETE',url, object);
	}
	public static async put(url, object  ){
		return await ServerForm.call('PUT',url, object);
	}
}

class Server{
	
	// TODO: get the url from a configuration 
	public static baseUrl : string = "http://localhost:5000";



}

export class WebApiConnection implements IAPI{
	getSystemUIs(preview: SystemPreview) {
		throw new Error("Method not implemented.");
	}
	public async getFactory(preview: SystemPreview) : Promise<APIReturnModel<TTRPGSystemJSONFormatting>> { 
		
		let serverResp = await ServerJson.get("api/factory/" + preview.id );
		if(serverResp.status == 200){ 
			let json = await serverResp.text();
			let objs : TTRPGSystemJSONFormatting = JSONHandler.deserialize(TTRPGSystemJSONFormatting,json);
			let response = {
				responseCode : serverResp.status,
				messages : [serverResp.statusText],
				response: objs
			} as APIReturnModel<TTRPGSystemJSONFormatting>
			return response;
		} else {
			let response = {
				responseCode : serverResp.status,
				messages : [serverResp.statusText]
			} as APIReturnModel<TTRPGSystemJSONFormatting>
			return response;
		} 
	}
	public async getAllSystems() : Promise<APIReturnModel<SystemPreview[]>>{
	
		let serverResp = await ServerJson.get("api/system");
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



	public async adminSendBlockUITemplate( formData : FormData ) : Promise<APIReturnModel<boolean>> {

		let serverResp = await ServerForm.post("api/template", formData );
		if(serverResp.status == 200){

			let json = await serverResp.text();
			var v = json ? true : false;
			let response = {
				responseCode : serverResp.status,
				messages : [serverResp.statusText],
				response: v
			} as APIReturnModel<boolean> 
			return response;
		} else {
			let response = {
				responseCode : serverResp.status,
				messages : [serverResp.statusText],
				response: false
			} as APIReturnModel<boolean>
			return response;
		} 
	}
}