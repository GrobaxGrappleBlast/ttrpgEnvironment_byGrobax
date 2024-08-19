import { KeyManager } from "../../Designer/Abstractions/KeyManager";
import { JsonBoolean, JsonString } from "../../JSONModules";

const systemPreviewKeyManager = new KeyManager();

export class SystemPreview {

	public id : string = systemPreviewKeyManager.getNewKey();
	public filePath:string ;

	public constructor(){
		
	}
	public init(){
		this.author = "grobax";
		this.version = "0.0.1";
		this.systemCodeName = "grobdnd";
		this.systemName = "Grobax' DnD TTPRPG";
	}

	@JsonBoolean()
	public isEditable		: boolean = true ;

	@JsonString()
	public author			: string ;
	
	@JsonString()
	public version			: string ;
	
	@JsonString()
	public systemCodeName	: string ;	

	@JsonString()
	public systemName		: string ;
	
	public folderPath		: string ;
	public folderName		: string ;
	
}


export class FilledSystemPreview  extends SystemPreview  {
	public constructor(){
		super();
		this.author = "grobax";
		this.version = "0.0.1";
		this.systemCodeName = "grobdnd";
		this.systemName = "Grobax' DnD TTPRPG";
	}
}