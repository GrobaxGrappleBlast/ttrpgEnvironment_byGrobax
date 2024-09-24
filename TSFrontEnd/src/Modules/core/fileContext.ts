import { Mutex } from "async-mutex";
import { FileHandler } from "./fileHandler";
import { JSONHandler } from 'grobax-json-handler';
import { TTRPGSystemJSONFormatting, TTRPG_SCHEMES } from "../GraphDesigner/index";
import { SystemPreview } from "./model/systemPreview";
import type { Message, messageList } from "../ObsidianUI/UIInterfaces/Designer01/BaseComponents/Messages/message";
import PluginHandler from "../ObsidianUI/app";
import { folder } from "jszip";
import { UILayoutModel } from "./model/UILayoutModel";

type command = { command:'file'|'folder' , path:string, content:string }
export class FileContext {

	private static mutex:Mutex = new Mutex();
	private path : string ; 

	// singleton implementation
	private static instance:FileContext;
	private constructor(){
		this.path = PluginHandler.PLUGIN_ROOT + '/' +
					PluginHandler.SYSTEMS_FOLDER_NAME; + '/' ;
	}
	public static getInstance(){ 
		if(!FileContext.instance){
			FileContext.instance = new FileContext();
		} 
		return FileContext.instance; 
	}

	public loadedSystem : string; 
	public foldersWithNoIndex: string[];
	public availableSystems: SystemPreview[]; 

	private async initSystemsStructure(){ 
		if (( await FileHandler.exists(this.path)) )
			return; 
		FileHandler.mkdir(this.path); 
	}


	private async loadPreviewAndfolder(folderPath:string){
		const indexPath = folderPath + '/index.json';
		const folderName = folderPath.split('/').last();
		let exists = await FileHandler.exists(indexPath)
		if( exists ){
			const content = await FileHandler.readFile(indexPath); 
			const systemPreview = JSONHandler.deserialize(SystemPreview,content);
			systemPreview.folderName	= folderName;
			systemPreview.folderPath	= folderPath;
			systemPreview.filePath		= indexPath; 
			return [systemPreview,folderName]
		}
		return [null,folderName];
	}
	private async loadPreview(folderPath:string){
		return (await this.loadPreviewAndfolder(folderPath))[0];
	}

	public static async loadAllAvailableFiles( ){
		let instance = FileContext.getInstance();
		return instance.loadAllAvailableFiles();
	}
	public async loadAllAvailableFiles( messages : messageList = {} ){ 
		let release = await FileContext.mutex.acquire(); 

			// find all folders, that could contain a system. 
			let lsDir = await FileHandler.lsdir(this.path);
			let systems = await Promise.all( lsDir.folders.map(async ( folderPath ) => {
				return await this.loadPreviewAndfolder(folderPath);
			})) 

			this.foldersWithNoIndex = [];
			this.availableSystems = [];

			// Sort into found and unfound
			systems.forEach( p => {
				if(p[0]){
					this.availableSystems	.push(p[0]);
				}else{
					this.foldersWithNoIndex .push(p[1]);
				}
			}) 
		release();
	}
 
	public static async createSystemDefinition( system : SystemPreview , messages : messageList = {} ) : Promise<SystemPreview | null> {
		let instance = FileContext.getInstance();
		return instance.createSystemDefinition(system, messages );
	}
	public async createSystemDefinition( system : SystemPreview , messages : messageList = {}) : Promise<SystemPreview | null>  {
		let release = await FileContext.mutex.acquire(); 

		 	this.initSystemsStructure();

			// create folder if not exists. 
			let folderPath = this.path + '/' + system.folderName;
			if (! await FileHandler.exists(folderPath)){
				await FileHandler.mkdir(folderPath)
			}
			else {
				if (await FileHandler.exists(folderPath + '/index.json')){
					messages['createSystem'] = {msg:`folder '${system.folderName}' already existed, and contained a system. \nEither delete the old system, or choose another foldername`, type:'error'};
					release();
					return null;
				}
			}
			
			/// create the system.'
			let filepath = folderPath+'/index.json';
			await FileHandler.saveFile( filepath , JSONHandler.serialize(system) )
			if (! await FileHandler.exists(filepath)){
				messages['createSystem'] = {msg:`tried to save index.json at '${filepath} \n but something went wrong.`, type:'error'};
				release();
				return null;
			}
			
			
			let systemReloaded = await this.loadPreview(folderPath);
		release();
		return systemReloaded;
	}

	public static async copySystemDefinition( system : SystemPreview , systemNew : SystemPreview , messages : messageList = {} ) : Promise<SystemPreview | null>   {
		let instance = FileContext.getInstance();
		return instance.copySystemDefinition(system,systemNew,messages);
	}
	public async copySystemDefinition( system : SystemPreview , systemNew : SystemPreview , messages : messageList = {}) : Promise<SystemPreview | null>  {
		
		let copiedSystem = await this.createSystemDefinition(systemNew, messages);
		if (!copiedSystem){
			return null;
		}
		
		async function DFSCopyAllFolders( path:string , newPath:string){
			let ls = await FileHandler.lsdir(path);
			await Promise.all( ls.folders.map(async ( folderPath ) => {
				let foldername = folderPath.split('/').last();
				let newFolderPath = newPath + '/' + foldername;
				FileHandler.mkdir(newFolderPath);
				await DFSCopyAllFolders(folderPath,newFolderPath);
			}));
		}

		async function BFSCopyAllFiles( path:string , newPath:string){


			let ls = await FileHandler.lsdir(path);
			await Promise.all( ls.files.map(async ( filePath ) => { 
				let file = await FileHandler.readFile(filePath);
				let fileName = filePath.split('/').last();
				await FileHandler.saveFile(newPath + '/'+ fileName ,file);
			}));
 
			await Promise.all( ls.folders.map(async ( folderPath ) => { 
				let segmentsPath = folderPath.split('/'); 
				let foldername = segmentsPath.pop();
				let newFolderPath = newPath + '/' + foldername;
				await BFSCopyAllFiles(folderPath,newFolderPath);
			}));
		}

		await DFSCopyAllFolders(system.folderPath, copiedSystem.folderPath);
		await BFSCopyAllFiles(system.folderPath, copiedSystem.folderPath); 
		await FileHandler.saveFile(copiedSystem.filePath, JSONHandler.serialize(copiedSystem) )
		return copiedSystem;

	}

	public static async systemDefinitionExistsInFolder( folder:string){
		let instance = FileContext.getInstance();
		return instance.systemDefinitionExistsInFolder(folder);
	}
	public async systemDefinitionExistsInFolder( folder:string ){
		let folderPath = this.path + '/' + folder;
		if (! await FileHandler.exists(folderPath)){
			 return false;
		}
		else { 
			if (await FileHandler.exists(folderPath + '/index.json')){ 
				return true;
			} 
		}
		return false;
	}


	public static async getOrCreateSystemsDesigns( folder:string){
		return FileContext.getInstance().systemDefinitionExistsInFolder(folder);
	}
	public async getOrCreateSystemsDesigns( folder:string ){
 
		// if the folder does not exist. return false 
		if (! await FileHandler.exists(folder)){
			return null;
		}

		// if the folder does not exist. return false 
		if (! await FileHandler.exists(folder)){
			return null;
		}

		// See if the file exists. 
		let filepath = folder + '/designer.json';
		if (!await FileHandler.exists(filepath)){

			// Create the file. 
			let designer = new TTRPGSystemJSONFormatting();
			designer.initAsNew();
			await FileHandler.saveFile( filepath , JSONHandler.serialize(designer) );

			return designer;
		}
		
		let file = await FileHandler.readFile(filepath);
		let loaded = JSONHandler.deserialize<TTRPGSystemJSONFormatting>( TTRPGSystemJSONFormatting, file );
		return loaded as TTRPGSystemJSONFormatting;
	}
	public async saveSystemsDesigns( folder:string , designer: TTRPGSystemJSONFormatting ){

		// if the folder does not exist. return false 
		if (! await FileHandler.exists(folder)){
			return null;
		}

		// if the folder does not exist. return false 
		if (! await FileHandler.exists(folder)){
			return null;
		}

		// See if the file exists. 
		let filepath = folder + '/designer.json';
		await FileHandler.saveFile( filepath , JSONHandler.serialize(designer) ); 
		return true;
	}
 
	private async loadFolderAndFilesRecursice(folderPath): Promise<command[]>{
		
		// first create this folder
		let c : command[] = []; 

		// load all files in the Folder
		const content = await FileHandler.lsdir(folderPath);
		let map = await Promise.all( content.files.map(async ( f ) => {
			return await this.loadFileAndCreateCommand(f);
		})) 	
		map.forEach( p => {
			c.push(p);
		})

		// load all folders in the folder 
		let map2 = await Promise.all( content.folders.map(async ( f ) => {
			return await this.loadFolderAndFilesRecursice(f);
		})) 	
		map2.forEach( p => {
			p.forEach(q => {
				c.push(q);
			});
		})
		

		return c;
	}
	private async loadFileAndCreateCommand( filepath ) : Promise<command>{
		let data = await FileHandler.readFile(filepath);
		return { 
			command:'file',
			path:filepath,
			content:data
		}
	}


	public async loadBlockUITemplate( ){
		
		const path =  PluginHandler.PLUGIN_ROOT + '/' + PluginHandler.BUILTIN_UIS_FOLDER_NAME + '/'; 
		let commands :command[] = [];

		// first we get the upper files in the folder 
		let exists = await FileHandler.exists(path)
		if( !exists ){
			throw new Error('File for BlockUI have been deleted. this feature longer works as a result')
		}
		  
		// FILES ADD TO COMMANDS 
		const content = await FileHandler.lsdir(path);
		let map = await Promise.all( content.files.map(async ( f ) => {
			return await this.loadFileAndCreateCommand(f);
		})) 	 
		map.forEach( p => {
			if(!p.path.endsWith("/declaration.ts")){
				let n : string = (p.path.split('BlockUIDev/').last() )?? '';
				p.path = "src/" + n; 
				commands.push(p);
			}
		}) 
		
		// then we load specifik Folders. 
		let pathsrc = path + '/' + 'src/';
		let map2 = await this.loadFolderAndFilesRecursice(pathsrc);
		map2.forEach(p=>{ 
			let n = p.path.split('BlockUIDev/').last() ?? '';
			p.path = n;
			if(n != "/src/"){
				commands.push(p);
			}
		}) 
		 
		return commands;
	}

	private async loadUILayout( foldersrc : string , errors : string[] = []){
		const src = foldersrc + '/' + PluginHandler.SYSTEM_UI_LAYOUTFILENAME ;
		const exists	= await FileHandler.exists( src );
		if(!exists)
			return null;

		const file = await FileHandler.readFile(src);
		let model : UILayoutModel;
		try {
			model = JSONHandler.deserialize(UILayoutModel,file);
		}catch(e){
			errors.push(e.message);
			return null;
		}

		model.folderSrc = foldersrc;
		await model.isValid();
		return model;
	}
	public async getAllBlockUIAvailablePreview( sys : SystemPreview ){
		const UIFolderpath = sys.folderPath + '/' + PluginHandler.SYSTEM_UI_CONTAINER_FOLDER_NAME;
		const exists = await FileHandler.exists(UIFolderpath)
		
		let layouts : UILayoutModel[]=[];
		if( exists ){
			let folders = (await FileHandler.lsdir(UIFolderpath)).folders;
			for (let i = 0; i < folders.length; i++) {
				const folder = folders[i];
				let layout = await this.loadUILayout(folder);
				if(layout)
					layouts.push(layout);
			}
		}
		return layouts;
	}




	
}