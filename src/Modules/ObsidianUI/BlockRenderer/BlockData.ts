import { SystemPreview } from "../../../../src/Modules/ObsidianUICore/model/systemPreview";
import { TTRPGSystem } from  "../../../../src/Modules/Designer";
import { JsonBoolean, JsonProperty, JsonString } from "../../../../src/Modules/JSONModules";
import PluginHandler from "../app";
import { UILayoutModel } from "../../../../src/Modules/ObsidianUICore/model/UILayoutModel";
import { BASE_SCHEME } from "../../../../src/Modules/JSONModules/JsonModuleConstants";

export class BlockDataSchemes{ 
	static BASE = BASE_SCHEME;
	static PAGE 	= 'PAGE'; 
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

	@JsonProperty({scheme:[BlockDataSchemes.BASE,BlockDataSchemes.PAGE]})
	public layout: any;
}