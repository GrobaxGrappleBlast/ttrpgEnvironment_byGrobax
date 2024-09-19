import { SystemPreview } from "../../../../src/Modules/ObsidianUICore/model/systemPreview";
import { JsonArrayClassTyped, JsonBoolean, JsonClassTyped, JsonProperty, JsonString } from "grobax-json-handler";
import PluginHandler from "../app";
import { UILayoutModel } from "../../../../src/Modules/ObsidianUICore/model/UILayoutModel";
import { BASE_SCHEME } from "grobax-json-handler";

export class BlockDataSchemes{ 
	static BASE = BASE_SCHEME;
	static PAGE 	= 'PAGE'; 
}

export class CNode { 
	
	@JsonString({scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	id:string;
	
	@JsonString({scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	type:string;

	@JsonString({scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	data:any;
}

export class SheetColumn{ 
	
	@JsonString({scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	id : string; 
	
	@JsonArrayClassTyped( CNode ,{scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	data : (CNode|null)[] = []; 
}

export class SheetRow{ 
	
	@JsonProperty({scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	id : string; 
	
	@JsonArrayClassTyped(SheetColumn ,{scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	data : (SheetColumn|null)[] = []; 
}

export class SheetData {

	@JsonProperty({scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	id : string;
	
	@JsonArrayClassTyped( SheetRow ,{scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	data : SheetRow[] = [];	 

}
export class BlockData{

	public static schemes = BlockDataSchemes;

	public constructor(){}

	@JsonString({scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	public BlockUUID:string = PluginHandler.uuidv4();

	@JsonBoolean({scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	public systemDataInFrontMatter:boolean = false;

	@JsonString({scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	public systemDataInFrontMatter_key:string = '';

	@JsonProperty({type:SystemPreview ,scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	public systemChosen:SystemPreview ;
	
	@JsonProperty({type:UILayoutModel,scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	public LayoutChosen:UILayoutModel ;

	@JsonProperty({scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	public characterValues: Record<string,number> ={}

	@JsonClassTyped(SheetData,{scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	public layout: SheetData;
}

