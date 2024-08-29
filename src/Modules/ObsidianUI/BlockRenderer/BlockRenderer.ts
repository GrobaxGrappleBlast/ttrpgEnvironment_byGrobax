
import { TFile } from "obsidian";
import { JSONHandler } from 'grobax-json-handler';
import PluginHandler from "../app";
import BlockStarter from "../UIInterfaces/BlockStarter/BlockStarter.svelte";
import { BlockData } from "./BlockData";
import { FileHandler } from "../../../../src/Modules/ObsidianUICore/fileHandler";
import path from 'path';
import { FileContext } from "../../../../src/Modules/ObsidianUICore/fileContext";

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
		
		let blockHead= '```'+PluginHandler.SYSTEM_LAYOUT_BLOCKNAME;
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
		const app = PluginHandler.self.app; 
		const vault = app.vault; 
		let file  = vault.getFileByPath(this.context.sourcePath)
		if(!file){ 
			return '';
		}

		const fileContent = await app.vault.read(file);
		let page = this.findBlockAndPasteInto(fileContent, txt )
		vault.modify(file,page);
	}

	public async render(){
 
		// if the block is brand new, just give it a guid, so we can distinguish blocks from eachother.
		let text = this.text;
		text.trim();
		if (text==''){
			this.writeBlock( PluginHandler.uuidv4() )
			return;
		}

		function isValidBlockText( self :BlockRenderer ){
			try{
				let t = self.text;
				t.trim();
				if ( t == ''){
					return null;
				}
				let blockData = JSONHandler.deserialize<BlockData>(BlockData , t, BlockData.schemes.PAGE );
				return blockData;
			}catch(e){
				return null;
			}
		}

		let blockData :BlockData | null = isValidBlockText(this);
		
		
		if ( blockData ){

			debugger
			let preview = blockData.systemChosen;

			debugger;

			let systemInstance = await FileContext.getOrCreateSystemsDesigns(preview.folderPath);
 
			let systemPath = path.join(PluginHandler.SYSTEMS_FOLDER_NAME, 'grobax1', PluginHandler.SYSTEM_UI_CONTAINER_FOLDER_NAME, 'default');
			let obsidianPath = path.join(PluginHandler.self.manifest.dir as string, systemPath);
		 
			let CSS= await FileHandler.readFile(obsidianPath + '/' +'style.css');

			let container = this.element.createEl('div');
			let style		= container.createEl('style');
				style.innerHTML = CSS;

			let AppContainer= container.createEl('div');
				AppContainer.id = blockData.BlockUUID;

			let script		= container.createEl('script');
				script.setAttribute('type','module');
  
			let path_JS = PluginHandler.App.vault.adapter.getResourcePath(obsidianPath + '/' +'components.js'); 
			
			window['GrobaxTTRPGGlobalVariable'][blockData.BlockUUID] = blockData;

			script.innerHTML = `
				import App from '${path_JS}';	
				let key = '${blockData.BlockUUID}';
				let sys = window['GrobaxTTRPGGlobalVariable']['${blockData.BlockUUID}'];
				debugger;
				function CreateApp ( obj ){		 
					const app = new App({
						target:document.getElementById('${blockData.BlockUUID}'),
						props: {
						
							textData:'${JSON.stringify(blockData.layout)}',
							sys:sys
						}
					}); 
				}
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