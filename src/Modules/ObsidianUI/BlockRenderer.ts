import { TTRPGSystem } from "../Designer";
import { JSONHandler, JsonProperty } from "../JSONModules";
import BlockStarter from "./UIInterfaces/BlockStarter/BlockStarter.svelte";

export class BlockData{

	@JsonProperty()
	public systemIndex  : string;

	@JsonProperty({type:TTRPGSystem})
	public systemData	: TTRPGSystem;
	
	@JsonProperty()
	public layout: any;
}
export class BlockRenderer{

	public text:string;
	public element:HTMLElement;
	public context:any;
	constructor(textContent : string , element : HTMLElement, context : any){
		this.text 		= textContent ?? ''; 
		this.element	= element; 
		this.context	= context;
	}
	public render(){

		function isValidBlockText( self :BlockRenderer ){
			let t = self.text;
			t.trim();
			if ( t == ''){
				return false;
			}
	
			try{
				JSON.parse(self.text);
			}catch(e){
				return false;
			}

			let blockData = JSONHandler.deserialize<BlockData>(BlockData , self.text);
			return blockData;
		}

		let blockData = isValidBlockText(this);
		if ( blockData ){
			this.element.innerHTML=`
				<link src="" />
				<
			`;
		}else{
			new BlockStarter({
				target:this.element,
				props:{
					WriteDown( txt ){} 
				}
			});
		} 
	}
}