import { TTRPGSystem } from  "../../../../src/Modules/Designer";
import { JsonProperty } from "../../../../src/Modules/JSONModules";

export class BlockData{

	@JsonProperty()
	public systemDataInFrontMatter:boolean = false;

	@JsonProperty()
	public systemDataInFrontMatter_key:string = 'key';

	@JsonProperty()
	public systemIndex  : string;

	@JsonProperty({type:TTRPGSystem})
	public systemData	: TTRPGSystem;
	
	@JsonProperty()
	public layout: any;
}