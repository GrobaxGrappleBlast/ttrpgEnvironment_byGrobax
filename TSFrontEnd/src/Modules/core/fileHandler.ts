import PluginHandler from "../ObsidianUI/app";

export class FileHandler{

	private static _instance : FileHandler;  
	public constructor(){
		if(FileHandler._instance == null ){
			FileHandler._instance  = new FileHandler(); 
		}
		return FileHandler._instance;
	}


	// Folder Handling
	public static async mkdir ( path ){
		return await PluginHandler.App.vault.adapter.mkdir( path );
	}
	public static async rmdir(path:string){ 
		return await PluginHandler.App.vault.adapter.rmdir(path,true);
	}


	// Path commands
	public static async lsdir( path : string ){
		return await PluginHandler.App.vault.adapter.list(path);
	}
	public static async exists( path : string ) : Promise<boolean> {
		return await PluginHandler.App.vault.adapter.exists( path , false );
	}


	// File Commands 
	public static async saveFile( path : string , fileContent:string ){ 
		return await PluginHandler.App.vault.adapter.write(path,fileContent);
	}	
	public static async readFile(path:string){ 
		return await PluginHandler.App.vault.adapter.read(path);
	}
 
	public static async rm(path:string){ 
		return await PluginHandler.App.vault.adapter.remove(path);
	}

	public static async copy(path:string, newPath:string ){ 
		return await PluginHandler.App.vault.adapter.copy(path,newPath);
	}

}
