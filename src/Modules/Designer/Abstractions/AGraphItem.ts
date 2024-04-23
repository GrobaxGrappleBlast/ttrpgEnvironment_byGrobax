
import { JsonString } from "../../../../src/Modules/JSONModules/Decorators";
import { KeyManager } from "./KeyManager";



var keyManager = new KeyManager();
export abstract class AGraphItem{
	
	constructor( name = '' , key = '' ) {
		this.name = name; 
		this.key = key + keyManager.getNewKey();  
	} 
 
	@JsonString()
	public name: string
	public key : any;

	public getName(){
		return this.name;
	}
	
	public setName( name ){
		this.name = name; 

	} 
	public getKey(){
		return this.key;
	} 
}