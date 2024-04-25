import { KeyManager } from "../../../../../src/Modules/Designer/Abstractions/KeyManager";
import { JsonString } from "../../../JSONModules";

const systemPreviewKeyManager = new KeyManager();

export class SystemPreview {

	public id : string = systemPreviewKeyManager.getNewKey();
	public filePath:string ;

	@JsonString()
	public author			: string ;
	
	@JsonString()
	public version			: string ;
	
	@JsonString()
	public systemCodeName	: string ;	

	@JsonString()
	public systemName		: string ;


}

