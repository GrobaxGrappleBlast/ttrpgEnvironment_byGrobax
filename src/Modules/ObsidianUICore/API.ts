import { promises } from "dns";
import { MessageTypes } from "../ObsidianUI/UIInterfaces/Designer01/BaseComponents/Messages/StaticMessageHandler.svelte";
import type { Message, messageList } from "../ObsidianUI/UIInterfaces/Designer01/BaseComponents/Messages/message";
import { StringFunctions } from "../ObsidianUI/UIInterfaces/Designer01/BaseFunctions/stringfunctions";
import type { APIReturnModel } from "./APIReturnModel"; 
import { SystemPreview } from "./model/systemPreview";
import { FileContext } from '../../../src/Modules/ObsidianUICore/fileContext';


// todo add convert code to message
function createResponse<T>( code : number , model:T , message : messageList ){
	return {
		responseCode:code,
		messages:message,
		response:model,
	} as APIReturnModel<T>;
}

export class ObsidianUICoreAPI {

	private constructor(){}
	private static instance : ObsidianUICoreAPI;
	public static getInstance(){
		if (!ObsidianUICoreAPI.instance){
			ObsidianUICoreAPI.instance = new ObsidianUICoreAPI();
		}	
		return ObsidianUICoreAPI.instance;
	}

	public systemDefinition = new SystemDefinitionManagement();
	public systemFactory	= new SystemFactory();
}


class SystemDefinitionManagement{

	private async recursiveFindNewFolderName( depth = 0, maxDepth = 5) : Promise<string | null>  {

		if(depth == maxDepth){
			return null;
		}

		let uuid = StringFunctions.uuidShort();
		if(await FileContext.systemDefinitionExistsInFolder(uuid)){
			return this.recursiveFindNewFolderName(depth + 1);
		}
		return uuid;
	}

	private async isValidSystemPreview( sys : SystemPreview, invalidMessages : messageList = {} ) : Promise<boolean> {
		let isValid = true;
		const systemPreviewValidationCode = 'spv';

		let _ = ''; 
		// Author 
		if( !sys.author  ){	
			invalidMessages[systemPreviewValidationCode+'1'] = {msg:'a author is not required but helpfull to users', type:  MessageTypes.verbose as any  } 
		}

		// Version 
		if( !sys.version  ){	
			invalidMessages[systemPreviewValidationCode+'2'] = {msg:'a version is not required but helpfull to users', type:  MessageTypes.verbose as any  }  
		}

		// SystemCodeName 
		if( !sys.systemCodeName  ){	
			isValid = false;  
			invalidMessages[systemPreviewValidationCode+'3'] = {msg:'Did not have a systemCodeName.\n can only contain regular letter and numbers, no special characters or whitespace', type:  MessageTypes.error as any  }  
		}else if (!StringFunctions.isValidSystemCodeName(sys.systemCodeName)){
			isValid = false;  
			invalidMessages[systemPreviewValidationCode+'4'] = {msg:'Did not have a valid systemCodeName.\n can only contain regular letter and numbers, no special characters or whitespace', type:  MessageTypes.error as any  } 
		}
		else if(
			(FileContext.getInstance().availableSystems.findIndex( p => p.systemCodeName == sys.systemCodeName))
			!= 
			-1
		){
			isValid = false; 
			invalidMessages[systemPreviewValidationCode+'d1'] = {msg:'shares Codename with another system', type:  MessageTypes.error as any  }
		}

		// SystemName No \n characters.
		if( !sys.systemName  ){	
			isValid = false;  
			invalidMessages[systemPreviewValidationCode+'5'] = {msg:'Did not have a system name.', type:  MessageTypes.error as any  }  
		}else if (!StringFunctions.isValidWindowsFileString(sys.systemName)){
			isValid = false;  
			invalidMessages[systemPreviewValidationCode+'6'] = {msg:'Did not have a valid system name.', type:  MessageTypes.error as any  }  
		}
		else if(
			(FileContext.getInstance().availableSystems.findIndex( p => p.systemName == sys.systemName))
			!= 
			-1
		){
			isValid = false; 
			invalidMessages[systemPreviewValidationCode+'d2'] = {msg:'shares name with another system', type:  MessageTypes.error as any  }
		}

		// folder only allow windows folder name accepted folder names.
		if( !sys.folderName  ){	

			let newFoldername = await this.recursiveFindNewFolderName(0,5);
			if(!newFoldername){
				invalidMessages[systemPreviewValidationCode+'7'] = {msg:'A new folder name is required, Must be unique.', type:  MessageTypes.error as any  }   
			}else{
				sys.folderName = newFoldername//
				invalidMessages[systemPreviewValidationCode+'8'] = {msg:'Did not have a folder name so created one.', type:  MessageTypes.verbose as any  }   
			}
		} 
		else if (!StringFunctions.isValidWindowsFileString(sys.folderName)){ 
			isValid = false;  
			invalidMessages[systemPreviewValidationCode+'9'] = {msg:'folder name was not valid windows folder name.', type:  MessageTypes.error as any  }   
		} 
		else if(
			(FileContext.getInstance().availableSystems.findIndex( p => p.folderPath.endsWith('/' + sys.folderName)))
			!= 
			-1
		){
			isValid = false;  
			invalidMessages[systemPreviewValidationCode+'d3'] = {msg:'folder name was already used, you must use another, or use an overwrite feature.', type:  MessageTypes.error as any  }
		}

		if(isValid){
			invalidMessages[systemPreviewValidationCode+'OK'] = {msg:'All is Good.', type:  MessageTypes.good as any  }
		}
		return isValid;
	}

	public async validateSystem( sys : SystemPreview ){
		let messages : messageList = {};
		try{
			if ( !await this.isValidSystemPreview(sys, messages) ){
				return createResponse(406,false,messages );
			}
			return createResponse(200,true,messages );
		}
		catch (e){
			messages['exception'] = {msg:e.message , type:'error'};
			return createResponse(500,null,messages );
		} 
	}

	public async CreateNewSystem( sys : SystemPreview ) : Promise<APIReturnModel<SystemPreview|null>> {
		let messages : messageList = {};
		try{
			if ( !await this.isValidSystemPreview(sys, messages) ){
				return createResponse(406,null,messages );
			}
		
			let createdAndReloaded = await FileContext.createSystemDefinition( sys );
			if (createdAndReloaded){
				return createResponse(200,createdAndReloaded,messages );
			}
			return createResponse(406,null,messages );
		}
		catch (e){
			messages['exception'] = {msg:e.message , type:'error'};
			return createResponse(500,null,messages );
		} 
	}

	public async CopySystem( from : SystemPreview, to : SystemPreview) : Promise<APIReturnModel<SystemPreview|null>> {
		let messages : messageList = {};
		try{
			if ( !await this.isValidSystemPreview(to, messages) ){
				return createResponse(406,null,messages );
			}

			let savedAndReloaded = await FileContext.copySystemDefinition( from , to );
			if (savedAndReloaded){
				return createResponse(200,savedAndReloaded,messages );
			}
			return createResponse(406,null,messages );
		}
		catch (e){
			messages['exception'] = {msg:e.message , type:'error'};
			return createResponse(500,null,messages );
		} 
	}

	public async Deletesystem( sys : SystemPreview ) : Promise<APIReturnModel<boolean>> {
		return createResponse(501,false,{} );
	}

	public async EditSystem( sys : SystemPreview ) : Promise<APIReturnModel<SystemPreview|null>>{
		return createResponse(501,null,{} );
	}

	public async getAllSystems() : Promise<APIReturnModel<SystemPreview[]|null>>{
		let messages : messageList = {};
		try{
			let fileContext = FileContext.getInstance();
			await fileContext.loadAllAvailableFiles( messages ); 
			let previews = fileContext.availableSystems ?? [];	
			return createResponse(200,previews,messages );
		}
		catch (e){
			messages['exception'] = {msg:e.message , type:'error'};
			return createResponse(500,null,messages );
		} 
	}
}

class SystemFactory{
	public async getOrCreateSystemFactory(){}
	public async saveSystemFactory(){}
	public async deleteSystemFactory(){}
}
