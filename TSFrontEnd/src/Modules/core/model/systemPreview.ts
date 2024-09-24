import { BASE_SCHEME } from "grobax-json-handler";
import { keyManagerInstance } from "ttrpg-system-graph";
import { JsonBoolean, JsonObject, JsonProperty, JsonString } from "grobax-json-handler";


export class SystemPreviewSchemes{ 
	static BASE = BASE_SCHEME;
	static PAGE 	= 'PAGE'; 
}

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
		this.code = "grobdnd";
		this.name = "Grobax' DnD TTPRPG";
	}

	@JsonBoolean({scheme:[SystemPreviewSchemes.BASE]})
	public isEditable		: boolean = true ;

	@JsonString({scheme:[SystemPreviewSchemes.BASE]})
	public author			: string ;
	
	@JsonString({scheme:[SystemPreviewSchemes.BASE,SystemPreviewSchemes.PAGE]})
	public version			: string ;
	
	@JsonString({scheme:[SystemPreviewSchemes.BASE,SystemPreviewSchemes.PAGE]})
	public code	: string ;	

	@JsonString({scheme:[SystemPreviewSchemes.BASE,SystemPreviewSchemes.PAGE]})
	public name		: string ;
	
	public folderPath		: string ;
	public folderName		: string ;
	
}


export class FilledSystemPreview  extends SystemPreview  {
	public constructor(){
		super();
		this.author = "grobax";
		this.version = "0.0.1";
		this.code = "grobdnd";
		this.name = "Grobax' DnD TTPRPG";
	}
}