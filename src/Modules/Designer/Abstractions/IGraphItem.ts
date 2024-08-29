
import { JsonString } from "grobax-json-handler";;
import { KeyManager } from "./KeyManager";




export interface IGraphItem{

	getName() : string;
	
	setName( name ) : void;

	getKey() : string ;
}