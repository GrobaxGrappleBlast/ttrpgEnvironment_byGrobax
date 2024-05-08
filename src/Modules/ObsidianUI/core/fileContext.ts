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



	public static async loadAllAvailableFiles( ){
		let instance = FileContext.getInstance();
		return instance.loadAllAvailableFiles();
	}
	public async loadAllAvailableFiles(){ 
		let release = await FileContext.mutex.acquire(); 

			// find all folders, that could contain a system. 
			let lsDir = await FileHandler.lsdir(this.path);
			let systems = await Promise.all( lsDir.folders.map(async ( folderPath ) => {
				const indexPath = folderPath + '/index.json';
				const folderName = folderPath.split('/').last();
				if( await FileHandler.exists(indexPath) ){
					const content = await FileHandler.readFile(indexPath);
					const systemPreview = JSONHandler.deserialize(SystemPreview,content);
					systemPreview.folderName	= folderName;
					systemPreview.folderPath	= folderPath;
					systemPreview.filePath		= indexPath; 
					return [systemPreview,folderName]
				}
				return [null,folderName];
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
 
	public static async createSystemDefinition( system : SystemPreview , out : (k:string,msg : Message) => any = (a,b) => null){
		let instance = FileContext.getInstance();
		return instance.createSystemDefinition(system,out);
	}
	public async createSystemDefinition( system : SystemPreview , out : (k:string,msg : Message) => any){
		let release = await FileContext.mutex.acquire(); 

		 	this.initSystemsStructure();
			
			// create folder if not exists. 
			let folderPath = this.path + '/' + system.folderName;
			if (! await FileHandler.exists(folderPath)){
				FileHandler.mkdir(folderPath)
			}
			else {

				// check if the index.json already exists
				let lsDir = await FileHandler.lsdir(this.path); 
				let foundIndex = false;
				await Promise.all( lsDir.files.map(async ( file ) => {
					// se if this is an index.json
					if (file.endsWith('/index.json')){
						return foundIndex = true;
					}
				})) 

				// if the file exists. the user must either delete it or choose another foldername. 
				if (foundIndex){
					out('createSystem',{msg:`folder '${system.filePath}' already existed, and contained a system. \nEither delete the old system, or choose another foldername`, type:'error'});
					release();
					return false;
				}

			}
			
			/// create the system.'
			let filepath = folderPath+'/index.json';
			FileHandler.saveFile( filepath , JSONHandler.serialize(system) )
			if (! await FileHandler.exists(filepath)){
				out('createSystem',{msg:`tried to save index.json at '${filepath} \n but something went wrong.`, type:'error'});
				release();
				return false;
			}
			


		release();
		return true;
	}

	
}