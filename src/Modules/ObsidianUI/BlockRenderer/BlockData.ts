import { TTRPGSystem } from  "../../../../src/Modules/Designer";
import { JsonProperty } from "../../../../src/Modules/JSONModules";
import GrobaxTTRPGSystemHandler from "../app";

export class BlockData{


	public constructor(){}

	@JsonProperty()
	public BlockUUID:string = GrobaxTTRPGSystemHandler.uuidv4();;

	@JsonProperty()
	public systemDataInFrontMatter:boolean = false;

	@JsonProperty()
	public systemDataInFrontMatter_key:string = '';

	@JsonProperty()
	public characterValues: Record<string,number> ={}


	@JsonProperty()
	public layout: any;
}