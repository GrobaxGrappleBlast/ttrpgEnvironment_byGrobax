
import { JsonString } from "grobax-json-handler";
import type { IGraphItem } from "./IGraphItem";
import { KeyManager } from "./KeyManager";



var keyManager = new KeyManager();
export abstract class AGraphItem implements IGraphItem{
	
	constructor( name = '' , key = '' ) {
		this.name = name; 
		this._key = key + keyManager.getNewKey();  
	} 
 
	@JsonString()
	public name: string
	public _key : any;

	public getName(){
		return this.name;
	}
	
	public setName( name ){
		this.name = name; 
	} 

	public getKey(){
		return this._key
	}
}