import JSZip from "jszip";
import { TTRPGSystemJSONFormatting } from "src/Modules/graphDesigner";
import { type groupKeyType } from "ttrpg-system-graph"; 

export class SystemExporterMethods { 
	public convertToTTRPGSystemToGUIBuilderPreview( system : TTRPGSystemJSONFormatting ){
		
		let result = 
			`export class TNode {  
				baseValue: number = 0;
				value: number | null = 0;
				dependencies: Record<string, TNode> = {};
				dependents: TNode[] = [];
				calc: string;
				updateListeners = {};

				constructor(basevalue: number, calc:string | null ) {
					this.baseValue = basevalue;
					this.calc = calc ?? '';
				}

				getValue(){
					return this.value ?? this.baseValue;
				}
				
							
				setValue( value:number ) {
					this.value = value;
					this.update();
					return 
				}

				addDependency(symbol, node) {
					this.dependencies[symbol] = node;
					node.dependents.push(this);
				}

				update() {

					if(this.calc != ''){
						let calcStr = this.calc;
						let symbols = Object.keys(this.dependencies);
						for (let i = 0; i < symbols.length; i++) {
							const s = symbols[i];
							const v = this.dependencies[s].getValue();
							//calcStr.replace(s,this.dependencies[s].getValue());
							calcStr = calcStr.replace(s, v + '');
						}
						this.value = eval(calcStr);
					}
			 
					( Object.keys(this.updateListeners) ).forEach( key => {
						this.updateListeners[key]();
					})
						
					for (let i = 0; i < this.dependents.length; i++) {
						const dep = this.dependents[i];
						dep.update();
					}
				}
				addUpdateListener( key , listener : () => any ){
					this.updateListeners[key] = listener;
				}
				removeUpdateListener( key ){
					delete this.updateListeners[key];
				}
				removeAllUpdateListeners(){
					this.updateListeners = {}
				}
			}`
		;

		let groups : groupKeyType[] = ['fixed','derived']
		result +=`
			export class system {
				public constructor(){this.init()}

			`;
				
				result += `
				data={
				`
						for (let g = 0; g < groups.length; g++) {
							const currGroup = groups[g]; 
							result += `
								${g!=0 ? ',':''}
								${currGroup} : { 
									collections_names:{`;
							
									let GroupNames = system.getCollectionNames(currGroup);
									for (let i = 0; i < GroupNames.length; i++) {
										
										const currColName = GroupNames[i];
										const currCol = system.getCollection(currGroup,currColName);
										if (!currCol){continue;}

										const currColNames = currCol.getNodeNames();
										
										let parsedColName = currColName;
										if ( currColName.includes(' ')){
											parsedColName = `'${parsedColName}'`;
										}

										result += `
										${ i != 0 ? ',':''} ${parsedColName} : 
										{
											nodes_names:{`
											for (let j = 0; j < currColNames.length; j++) {
												const currItemName = currColNames[j];
												const currItem = system.getNode(currGroup,currColName,currItemName);
												
												if(!currItem){
													continue;
												}

												let parsedItemName = currItemName;
												if ( currItemName.includes(' ')){
													parsedItemName = `'${parsedItemName}'`;
												}

												result+= `${ j != 0 ? ',':''} ${parsedItemName} : new TNode(${currItem?.getValue()}, '${currItem['calc'] ?? ''}')`;
											}

											result += `
											}
										}` 
									}
											
							result +=`
								}
							}`;
						}
				result += `
				}
				`

				result += ` 
				public getNode(group, collection, item) {
					if ( !this.data[group] || !this.data[group].collections_names[collection] || !this.data[group].collections_names[collection].nodes_names[item] ){
						return null;
					}
					return this.data[group].collections_names[collection].nodes_names[item];
				}`

				result += ` 
				public getNodeNames(group, collection ) {
					if ( !this.data[group] || !this.data[group].collections_names[collection] ){
						return [];
					}
					return Object.keys( this.data[group].collections_names[collection].nodes_names );
				}`

				result += ` 
				public hasNode(group, collection, item) {
					if ( !this.data[group] || !this.data[group].collections_names[collection] || !this.data[group].collections_names[collection].nodes_names[item] ){
						return false;
					}
					return true;
				}`

				result += ` 
				public getCollectionNames( group ) {
					if ( !this.data[group] ){
						return [];
					}
					return Object.keys( this.data[group].collections_names );
				}`

				result += ` 
				public hasCollection(group, collection ) {
					if ( !this.data[group] || !this.data[group].collections_names[collection] ){
						return false;
					}
					return true;
				}`




				result += `	
				private declareDependency(Parentgroup, Parentcollection, Parentitem, symbol, Depgroup, depcollection, depitem) {
					let parent	= this.getNode(Parentgroup, Parentcollection, Parentitem);
					let dep		= this.getNode(Depgroup, depcollection, depitem);
					
					if ( !dep || !parent ){
						console.error(\`
							Error at declareDependency
							\${Parentgroup}, \${Parentcollection}, \${Parentitem}, \${symbol}, \${Depgroup}, \${depcollection}, \${depitem}
							\`
						)
						return ;
					}
					parent.addDependency(symbol,dep);
				}`

				// Create The Graph Setup, using Dependents
				result += ` 
				private init(){
				`;
					
					const currGroup = 'derived'
					let GroupNames = system.getCollectionNames(currGroup);
					
					for (let i = 0; i < GroupNames.length; i++) {
						
						const currColName = GroupNames[i];
						const currCol = system.getCollection(currGroup,currColName);
						if (!currCol){continue;}
						const currColNames = currCol.getNodeNames();

						for (let j = 0; j < currColNames.length; j++) { 
							const currItemName = currColNames[j];
							const currItem = system.getNode(currGroup,currColName,currItemName);
							
							if(!currItem)
								continue;

							for (let o = 0; o < (currItem['origins']?.length); o++) {
								const origin = currItem['origins'][o];
								let originPathSegments = origin.originKey.split('.');
								result += `
								this.declareDependency('${currGroup}','${currColName}','${currItemName}','${origin.symbol}','${originPathSegments[0]}','${originPathSegments[1]}','${originPathSegments[2]}')`;
							}
						} 
					} 
					
				result +=
					`
				}`

				result += `
			}`; 
		
		return result;
	} 

	/*
	public async loadBlockUITemplate( ){
		 
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
	

	public async createBlockUITemplatefile( system:TTRPGSystemJSONFormatting ): Promise<Blob | null > {
		let resp =  await ( ObsidianUICoreAPI.getInstance()).UIImportExport.loadBlockUIForExport();  
		if (resp.responseCode != 200){
			return null;
		}

		const zip	= new JSZip();
		var f = zip.folder( "src") as JSZip ;

		// insert files and folders 
		resp.response.forEach(p => {
			let segs = p.path.split('/');
			if(!segs ||segs.length == 0){
				return;
			}
			   
			// if it has folder parent
			let lastIndex = p.path.lastIndexOf('/');
			let filename = p.path.substring(lastIndex+1,p.path.length);
			let parentName = p.path.substring(0,lastIndex);
			let parentFolder = f; ;

			parentFolder.file(p.path,p.content)  
		})

		 
		// attach a File to a declaration.ts
		//dictionary['src'].file('declaration.ts',await this.convertToTTRPGSystemToGUIBuilderPreview(system));
		f.file('src/declaration.ts',await this.convertToTTRPGSystemToGUIBuilderPreview(system));
		 

		const content = await zip.generateAsync({ type: 'blob' });
		return content;		 
	}
	*/ 
	
	public async createBlockUITemplatefileTEST( system:TTRPGSystemJSONFormatting ): Promise<string | null > {
		let a =  await this.convertToTTRPGSystemToGUIBuilderPreview(system);
		return a;
	}
}