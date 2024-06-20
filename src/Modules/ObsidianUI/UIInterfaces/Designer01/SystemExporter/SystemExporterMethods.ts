import { TTRPGSystem, type groupKeyType } from "../../../../../../src/Modules/Designer";

export class SystemExporterMethods { 
	public convertToTTRPGSystemToGUIBuilderPreview( system : TTRPGSystem ){
		
		let result = 
			`class TNode {  
				baseValue:number = 0;
				value:number|null=null;
				dependencies: Record<string,TNode> = {};
				dependents:TNode[];
				calc:string;

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
			
					for (let i = 0; i < this.dependents.length; i++) {
						const dep = this.dependents[i];
						dep.update();
					}
				}
			}`
		;

		let groups : groupKeyType[] = ['fixed','derived']
		result +=`
			class system {
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
					
					result += `${ i != 0 ? ',':''} ${currColName} : {`

					for (let j = 0; j < currColNames.length; j++) {
						const currItemName = currColNames[j];
						const currItem = system.getNode(currGroup,currColName,currItemName);
						
						if(!currItem){
							continue;
						}

						result+= `${ j != 0 ? ',':''} ${currItemName} : new TNode(${currItem?.getValue()}, '${currItem['calc'] ?? ''}')`;
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
			parent.addDependency( dep , symbol );
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

		result += '\nnew system();'
		
		return result;
	} 
}