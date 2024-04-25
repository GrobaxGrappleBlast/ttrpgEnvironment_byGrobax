import { Mutex } from "async-mutex";
import { FileHandler } from "./fileHandler";
import { JSONHandler } from "../../../../src/Modules/JSONModules";
import { TTRPGSystem, TTRPG_SCHEMES } from "../../../../src/Modules/Designer/index";
import { SystemPreview } from "./model/systemPreview";

export class FileContext {
	/*
		private static mutex:Mutex = new Mutex();
		public loadedSystem : string;
		public availableFiles : string[];
		public foldersWithNoIndex: string[];
		public availableSystems: SystemPreview[];
		public availableFilesWithErrors:string[];

		public async loadAllAvailableFiles(){
			let release = await FileContext.mutex.acquire(); 

				let lsDir = await FileHandler.lsdir('');
				let filesFound = await Promise.all( lsDir.folders.map(async ( folderPath ) => {
					// find an index.json.
					const foldercontent =  await FileHandler.lsdir( folderPath ); 
					let file =  foldercontent.files.find(p=>p == 'index.json' );
					return [file,folderPath];
				})) 

				let found	: string[] = [];
				let unfound	: string[] = [];
				filesFound.forEach( p => {
					if (p[0]==null) {
						unfound.push( p[1] as string );
					}
					else {
						found.push( p[0] );
					}
				})

				this.foldersWithNoIndex = unfound;
				this.availableFiles 	= found; 

				this.availableSystems = [];
				this.availableFilesWithErrors = []
				this.availableFiles.forEach( file => {
					let preview = JSONHandler.deserialize(SystemPreview,file);
					preview.filePath=file;
					if (preview) {
						this.availableSystems.push(preview)
					} else {
						this.availableFilesWithErrors.push(file)
					} 
				});

			release();
		}

		public async cleanAllFoldersWithoutSystems(){
			let release = await FileContext.mutex.acquire(); 

			release();
		}

		public async loadSystem( systemIndexPath:string ){
			let release = await FileContext.mutex.acquire();

				let exists = FileHandler.exists( systemIndexPath );
				if(!exists){
					release();
					return false;
				} 
				let filetext	= FileHandler.readFile( systemIndexPath );
				let system		= JSONHandler.deserialize(TTRPGSystem,filetext,TTRPG_SCHEMES.GRAPH);
			
			release();
			return system	;
		}

		public async saveSystem( system:TTRPGSystem ){
			throw new Error('NOT IMPLEMENTED'); 
		}
	*/
}