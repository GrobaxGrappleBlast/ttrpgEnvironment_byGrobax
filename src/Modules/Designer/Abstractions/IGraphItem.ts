
import { JsonString } from "../../JSONModules/Decorators";
import { KeyManager } from "./KeyManager";




export interface IGraphItem{

	getName() : string;
	
	setName( name ) : void;

	getKey() : string ;
}