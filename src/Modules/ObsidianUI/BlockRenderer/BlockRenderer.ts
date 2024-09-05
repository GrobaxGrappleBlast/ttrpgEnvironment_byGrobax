

import { JSONHandler } from 'grobax-json-handler';
import PluginHandler from "../app";
import BlockStarter from "../UIInterfaces/BlockStarter/BlockStarter.svelte";
import { BlockData, BlockDataSchemes } from "./BlockData";
import { FileHandler } from "../../../../src/Modules/ObsidianUICore/fileHandler";
import path from 'path'; 
import { ObsidianUICoreAPI } from '../../../../src/Modules/ObsidianUICore/API'; 
import { TTRPGSystemJSONFormatting } from '../../../../src/Modules/Designer';
import { SheetData } from './ComponentNode';

export class BlockRenderer{

	public text:string;
	public element:HTMLElement;
	public context:any;

	public blockData : BlockData;

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


	private async getSystem( tag, blockData ){
		// get the right System Preview
		let resp = await ObsidianUICoreAPI.getInstance().systemDefinition.getAllSystems();
		if (resp.responseCode != 200 ){
			//TODO: also get out the messages
			tag.innerHTML="<div>TTPRPG - Could Not Load Available Systems</div>"
			return null;
		}
		let chosenSystem = resp.response?.find( p => p.systemCodeName == blockData.systemChosen.systemCodeName );

		// ensure it exits
		if(!chosenSystem){
			tag.innerHTML="<div>The Chosen TTRPG did not apear in Available Systems </div>"
			return null;
		}

		// get the system factory.
		let resp2 = await ObsidianUICoreAPI.getInstance().systemFactory.getOrCreateSystemFactory(chosenSystem);
		if (resp2.responseCode != 200 ){
			//TODO: also get out the messages
			tag.innerHTML="<div>SOMETHING WENT WRONG 2</div>"
			return null;
		}
		let sys = resp2.response as TTRPGSystemJSONFormatting;
		return sys;
	}
	private setSystemValuesFromBlockData( sys : TTRPGSystemJSONFormatting , blockData : BlockData){ 
		

		let commandDict = {};

		// Create commands for all fixed stats, all standard values 
		const group_key = 'fixed'; 
		const col_keys = Object.keys(sys.fixed.collections_names)
		for (let c = 0; c < col_keys.length; c++) {
			const col_key = col_keys[c];
			const col = sys.fixed.collections_names[col_key]; 
			const node_keys = Object.keys(col.nodes_names);
			for (let n = 0; n < node_keys.length; n++) {
				const node_key = node_keys[n];
				const node = col.nodes_names[node_key];

				commandDict[group_key+'.'+col_key+'.'+node_key] = node.getValue() ?? 0;
			}
		} 

		// insert Values for all specified values. 
		let blockCommands = Object.keys(blockData.characterValues);
		for (let c = 0; c < blockCommands.length; c++) {
			const cmd = blockCommands[c];
			commandDict[cmd] = blockData.characterValues[cmd];
		}

		// Run updates;
		const commands = Object.keys(commandDict);
		for (let c = 0; c < commands.length; c++) {
			const cmd = commands[c];
			const seg = cmd.split('.') as any[];
			sys.getNode(seg[0],seg[1],seg[2])?.setValue(commandDict[cmd]);
		}		  
	}
	private static getSystemValuesForBlockData( sys : TTRPGSystemJSONFormatting  ){ 
		

		let commandDict = {};

		// Create commands for all fixed stats, all standard values 
		const group_key = 'fixed'; 
		const col_keys = Object.keys(sys.fixed.collections_names)
		for (let c = 0; c < col_keys.length; c++) {
			const col_key = col_keys[c];
			const col = sys.fixed.collections_names[col_key]; 
			const node_keys = Object.keys(col.nodes_names);
			for (let n = 0; n < node_keys.length; n++) {
				const node_key = node_keys[n];
				const node = col.nodes_names[node_key];

				// TODO: implement this with standard values 
				if(node.getValue() != 0){
					commandDict[group_key+'.'+col_key+'.'+node_key] = node.getValue();
				}
			}
		} 
		return commandDict;
		 
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
		  
			let systemPath = path.join(PluginHandler.SYSTEMS_FOLDER_NAME, 'grobax1', PluginHandler.SYSTEM_UI_CONTAINER_FOLDER_NAME, 'default');
			let obsidianPath = path.join(PluginHandler.self.manifest.dir as string, systemPath);
		
			let CSS = await FileHandler.readFile(obsidianPath + '/' +'style.css');

			 
			// Create HTML elements for the block.
			if( window['GrobaxTTRPGGlobalVariable'][blockData.BlockUUID] ){
				return;
			}  
			let container = this.element.createEl('div');
				container.setAttr('data-hasViewActive','true');
			let style		= container.createEl('style');
				style.innerHTML = CSS; 
			let AppContainer= container.createEl('div');
				AppContainer.id = blockData.BlockUUID; 
			let script		= container.createEl('script');
			script.setAttribute('type','module'); 
		  
			// get the right System Preview 
			let sys = await this.getSystem(AppContainer, blockData) as TTRPGSystemJSONFormatting;
			if(!sys){
				return;
			}

			// Set SystemValues 
			this.setSystemValuesFromBlockData(sys,blockData);
  
			// ADD AlL UI
			window['GrobaxTTRPGGlobalVariable'][blockData.BlockUUID] ={};
			window['GrobaxTTRPGGlobalVariable'][blockData.BlockUUID]['sys'] = sys; 
			window['GrobaxTTRPGGlobalVariable'][blockData.BlockUUID]['func'] = 
			( layoutChange , system ) => {
				blockData.layout = layoutChange;
				blockData.characterValues = BlockRenderer.getSystemValuesForBlockData(system); 
				const txt = JSONHandler.serialize(blockData , BlockDataSchemes.PAGE ); 
				window['GrobaxTTRPGGlobalVariable'][blockData.BlockUUID] = undefined;
				this.writeBlock(txt);

			
			}; 
			let path_JS = PluginHandler.App.vault.adapter.getResourcePath(obsidianPath + '/' +'components.js'); 
			
			// A Hack - because pasting the string removes the right \ symbols, so we just add an extra where it is needed.
			const textData = JSON.stringify(blockData.layout).replaceAll('\"','\\"');
			script.innerHTML = ` 
				import App from '${path_JS}';	
				let key = '${blockData.BlockUUID}';
				const sys = window['GrobaxTTRPGGlobalVariable']['${blockData.BlockUUID}']['sys'];
				
				const element = document.getElementById('${blockData.BlockUUID}');
				const textData= '`+textData+`';
				 
				const app = new App({
					target:element,
					props: {
						textData:textData,
						sys:sys,
						writeBlock:window['GrobaxTTRPGGlobalVariable']['${blockData.BlockUUID}']['func']
					}
				});  
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