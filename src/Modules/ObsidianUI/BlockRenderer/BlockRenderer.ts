
import { JSONHandler } from "../../../../src/Modules/JSONModules";
import BlockStarter from "../UIInterfaces/BlockStarter/BlockStarter.svelte";
import { BlockData } from "./BlockData";


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
				<link rel="stylesheet" href="style.css">
				<div id="MyElementInnerContaienr_GrobaTTPRPGVIEW" ></div>
				<script type="module"> 
					import App from 'components.js';
					const app = new App({
						target: document.getElementById('MyElementInnerContaienr_GrobaTTPRPGVIEW'),
						props: {
							textData:_JSON,
							sys:sys
						}
					});
				</script>
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