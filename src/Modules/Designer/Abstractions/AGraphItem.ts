
import { KeyManager } from "./KeyManager";



var keyManager = new KeyManager();
export abstract class AGraphItem{
	
	constructor( name , key , controller : any ) {
		this.name = name; 
		this.key = key + keyManager.getNewKey(); 
		this.controller = controller;
	} 

	protected controller:any;
	protected name: string
	protected key : any;

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