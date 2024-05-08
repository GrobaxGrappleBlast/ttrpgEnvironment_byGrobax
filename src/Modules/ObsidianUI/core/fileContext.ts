import { Mutex } from "async-mutex";
import { FileHandler } from "./fileHandler";
import { JSONHandler } from "../../../../src/Modules/JSONModules";
import { TTRPGSystem, TTRPG_SCHEMES } from "../../../../src/Modules/Designer/index";
import { SystemPreview } from "./model/systemPreview";
import type { Message } from "../UIInterfaces/Designer01/BaseComponents/Messages/message";
import GrobaxTTRPGSystemHandler from "../app";

export class FileContext {

	private static mutex:Mutex = new Mutex();
	private path : string ; 

	// singleton implementation
	private static instance:FileContext;
	private constructor(){
		this.path = GrobaxTTRPGSystemHandler.PLUGIN_ROOT + '/' +
					GrobaxTTRPGSystemHandler.SYSTEMS_FOLDER_NAME; + '/' ;

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
	public async loadAllAvailableFiles(){ 
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
 
	public static async createSystemDefinition( system : SystemPreview , out : (k:string,msg : Message) => any = (a,b) => null) : Promise<SystemPreview | null> {
		let instance = FileContext.getInstance();
		return instance.createSystemDefinition(system,out);
	}
	public async createSystemDefinition( system : SystemPreview , out : (k:string,msg : Message) => any) : Promise<SystemPreview | null>  {
		let release = await FileContext.mutex.acquire(); 

		 	this.initSystemsStructure();

			// create folder if not exists. 
			let folderPath = this.path + '/' + system.folderName;
			if (! await FileHandler.exists(folderPath)){
				await FileHandler.mkdir(folderPath)
			}
			else {
				if (await FileHandler.exists(folderPath + '/index.json')){
					out('createSystem',{msg:`folder '${system.folderName}' already existed, and contained a system. \nEither delete the old system, or choose another foldername`, type:'error'});
					release();
					return null;
				}
			}
			
			/// create the system.'
			let filepath = folderPath+'/index.json';
			await FileHandler.saveFile( filepath , JSONHandler.serialize(system) )
			if (! await FileHandler.exists(filepath)){
				out('createSystem',{msg:`tried to save index.json at '${filepath} \n but something went wrong.`, type:'error'});
				release();
				return null;
			}
			
			
			let systemReloaded = await this.loadPreview(folderPath);
		release();
		return systemReloaded;
	}

	public static async copySystemDefinition( system : SystemPreview , systemNew : SystemPreview , out : (k:string,msg : Message) => any = (a,b) => null ) : Promise<SystemPreview | null>   {
		let instance = FileContext.getInstance();
		return instance.copySystemDefinition(system,systemNew,out);
	}
	public async copySystemDefinition( system : SystemPreview , systemNew : SystemPreview , out : (k:string,msg : Message) => any) : Promise<SystemPreview | null>  {
		
		let copiedSystem = await this.createSystemDefinition(systemNew, out);
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
				debugger
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

	
}