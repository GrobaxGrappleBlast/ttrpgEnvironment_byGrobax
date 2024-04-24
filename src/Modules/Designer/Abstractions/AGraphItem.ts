
import { JsonString } from "../../../../src/Modules/JSONModules/Decorators";
import { KeyManager } from "./KeyManager";



var keyManager = new KeyManager();
export abstract class AGraphItem{
	
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

	public _____getKey(){
		return this._key
	}
}