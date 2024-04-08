import exp from "constants";
import { JSONHandler, JsonMapping, JsonMappingRecordInArrayOut, JsonProperty } from "../Decorators";


export class BoolContainer {
	
	constructor(){}

	public init( numfundamentbricks = 5){	
		this.simple = true;
		this.array = [true, true, true];
		this.forced_to1 = "maybe";
		this.forced_to21 = 0;
		this.forced_to22 = 11.3;
		this.forced_to3 = {name:"ornfreyd"};
	}

	public simple : boolean;
	public array : boolean[];
	
	public forced_to1: string;
	public forced_to21: number;
	public forced_to22: number;
	public forced_to3: object;
}