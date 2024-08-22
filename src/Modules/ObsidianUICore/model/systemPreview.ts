import { keyManagerInstance } from "../../Designer/Abstractions/KeyManager";
import { JsonBoolean, JsonObject, JsonProperty, JsonString } from "../../JSONModules";




@JsonObject({
	onAfterDeSerialization:(self:SystemPreview, ...args )=>{
		self.id = keyManagerInstance.getNewKey();
	}
})
export class SystemPreview {

	public id : string = keyManagerInstance.getNewKey();
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