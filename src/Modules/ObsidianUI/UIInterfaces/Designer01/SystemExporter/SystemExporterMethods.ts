import JSZip from "jszip";
import { TTRPGSystem, type groupKeyType } from "../../../../../../src/Modules/Designer";
import { ObsidianUICoreAPI } from "../../../../../../src/Modules/ObsidianUICore/API";

export class SystemExporterMethods { 
	public convertToTTRPGSystemToGUIBuilderPreview( system : TTRPGSystem ){
		
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

		for (let g = 0; g < groups.length; g++) {
			const currGroup = groups[g]; 
			result += `
				${currGroup} = {`;
			
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

					result += `${ i != 0 ? ',':''} ${parsedColName} : {`

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
					}` 
				}
						
			result +=`
				}`;
		}

		result += ` 
		public getNode(group, collection, item) {
			if ( !this[group] || !this[group][collection] || !this[group][collection][item] ){
				return null;
			}
			return this[group][collection][item];
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

					for (let o = 0; o < (currItem['origins']?.length) ?? 0; o++) {
						const origin = currItem['origins'][o];
						let originPathSegments = origin.originKey.split('.');
						result += `
						this.declareDependency('${currGroup}','${currColName}','${currItemName}','${origin.symbol}','${originPathSegments[0]}','${originPathSegments[1]}','${originPathSegments[2]}')`;
					}
					console.log(currItem);

				} 
			} 
			
		result +=
			`
		}`

		result += `
			}`; 
		
		return result;
	} 

	//	async function onPreviewSelected( preview : SystemPreview ){
	//		selectedSystemPreview.set( preview );
	//		let resp =  await ( ObsidianUICoreAPI.getInstance()).systemFactory.getOrCreateSystemFactory( preview ); 
	//		if (resp.responseCode >= 200 && resp.responseCode <= 300 && resp.response ){
	//			let o = resp.response;
	//			selectedSystem.set( o );
	//			state = SystemEditorStates.designer;  
	//		}else{
	//			console.error('tried to fetch TTPRGSystem, but something went wrong');
	//		} 
	//	}

	public async createBlockUITemplatefile( system:TTRPGSystem ){
		
		let resp =  await ( ObsidianUICoreAPI.getInstance()).export.loadBlockUIForExport(); 
		let dictionary : Record<string,JSZip> = {};
		 

		if (resp.responseCode != 200){
			return 
		}

		const zip	= new JSZip();
		
		// insert files and folders
		resp.response.forEach(p => {
			let segs = p.path.split('/');
			if(!segs ||segs.length == 0){
				return;
			}
			
			if ( p.command == 'folder'){
				
					// if it has folder parent
					let lastIndex = p.path.lastIndexOf('.');
					let parentFolder = p.path.substr(0, lastIndex)
					let f : JSZip;

					if(dictionary[parentFolder]){
						// @ts-ignore;
						f = dictionary[parentFolder].folder(segs.last());
					}else{
						// @ts-ignore;
						f = zip.folder(  segs.last() );

					}
					// @ts-ignore;
					dictionary[p.path] = f; 
				
			}else{
				
				// if it has folder parent
				let lastIndex = p.path.lastIndexOf('/');
				let filename = p.path.substring(lastIndex+1,p.path.length);
				let parentFolder = dictionary[p.path];
				
				if(parentFolder){
					// @ts-ignore;
					parentFolder.file(filename,p.content)
				} 
			}
		})

		 
		// attach a File to a declaration.ts
		dictionary['src'].file('declaration.ts',await this.convertToTTRPGSystemToGUIBuilderPreview(system));
 
		const content = await zip.generateAsync({ type: 'blob' });
		return content;		 

		//	const zip	= new JSZip();
		//	let src		= zip.folder('myFolder');
		//	src?.file('declaration.ts', this.convertToTTRPGSystemToGUIBuilderPreview(system) );
		//	src?.file('index.html'			, 'Content');
		//	src?.file('package.json'		, 'Content');
		//	src?.file('package-lock.json'	, 'Content');
		//	src?.file('README.md'			, 'Content');
		//	src?.file('svelte.config.js'	, 'Content');
		//	src?.file('tsconfig.json'		, 'Content');
		//	src?.file('tsconfig.node.json'	, 'Content');
		//	src?.file('vite.config.ts'		, 'Content');

		
	}
}