
import { TFile } from "obsidian";
import { JSONHandler } from "../../../../src/Modules/JSONModules";
import GrobaxTTRPGSystemHandler from "../app";
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


	
	private findBlockAndPasteInto(filetext:string, content:string ){
		
		let blockHead= '```'+GrobaxTTRPGSystemHandler.SYSTEM_LAYOUT_BLOCKNAME;
		let pieces = filetext.split(blockHead);
		// only a single block is on the page
		if(pieces.length == 2){
			
			let afterblock_index = pieces[1].indexOf('```');
			let block = pieces[1].substring(0,afterblock_index)
			let afterblock = pieces[1].split('```',2)[1];
 
			let page :string = pieces[0] + blockHead + "\n" + content + "\n```" + afterblock;
			return page;
		}
		return ''

	}
	public async writeBlock(txt){
		
		const app = GrobaxTTRPGSystemHandler.self.app; 
		const vault = app.vault; 
		let file  = vault.getFileByPath(this.context.sourcePath)
		if(!file){
			console.log('!!NOTFILE');
			return '';
		}

		const fileContent = await app.vault.read(file);
		let page = this.findBlockAndPasteInto(fileContent, txt )
		vault.modify(file,page);
	}
	public render(){

		let text = this.text;
		text.trim();
		if (text==''){
			this.writeBlock( GrobaxTTRPGSystemHandler.uuidv4() )
			return;
		}

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
					WriteDown: (txt) =>this.writeBlock(txt)
				}
			});
		} 
	}
}