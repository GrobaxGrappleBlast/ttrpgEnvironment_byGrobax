import { GrobCollection } from "../GrobCollection";
import { GrobGroup } from "../GrobGroup";
import type { GrobNodeType } from "../GraphV2/TTRPGSystemsGraphDependencies";
import { GrobDerivedNode, GrobDerivedOrigin, GrobFixedNode } from "../GrobNodte";
import { JsonObject, JsonMappingRecordInArrayOut, JsonClassTyped, JsonString } from "../../JSONModules/index"; 
import { TTRPGSystemGraphModel } from "../GraphV2/TTRPGSystemGraphModel";
import { BASE_SCHEME } from "../../../../src/Modules/JSONModules/JsonModuleConstants";
import { getMetadata, getMetaDataKeys, getOwnMetaData, getOwnMetaDataKeys } from "../../../../src/Modules/JSONModules/JsonModuleBaseFunction";
import PluginHandler from "../../../../src/Modules/ObsidianUI/app";
 
export class GrobCollectionDerived extends GrobCollection<GrobDerivedNode>{
	
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName', name:'data',type:GrobDerivedNode , preSerializationConversion : true})
	nodes_names: Record<string, GrobDerivedNode> = {}
}

export class GrobCollectionFixed extends GrobCollection<GrobFixedNode>{

	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName', name:'data',type:GrobFixedNode , preSerializationConversion : true})
	nodes_names: Record<string, GrobFixedNode> = {}
}

export class GrobGroupDerived extends GrobGroup<GrobDerivedNode>{
	
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName', name:'data',type :GrobCollectionDerived , preSerializationConversion : true})
	collections_names: Record<string, GrobCollectionDerived > = {};

}
 
export class GrobGroupFixed extends GrobGroup<GrobFixedNode>{
	
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName', name:'data', type :GrobCollectionFixed , preSerializationConversion : true })
	collections_names: Record<string,GrobCollectionFixed> = {};

}

let baseSchemeValue = BASE_SCHEME
export class TTRPG_SCHEMES {
	static GRAPH 	= BASE_SCHEME ;
	static PREVIEW ='mini';
} 

/**
 *  handles Model operations and Data Containment, 
 * Ensures that data is maintained, as well as graphlinks
*/
@JsonObject({
	onBeforeSerialization:(self:TTRPGSystemJSONFormatting) => {},
	onAfterDeSerialization:(self:TTRPGSystemJSONFormatting, ...args ) => {
		
		// add derived and fixed to groups 
		if ( !self.fixed	 ){
			self._createGroup('fixed');
			self.fixed	 = self._getGroup('fixed')	 as GrobGroupFixed	;
		}else{
			self.data['fixed'] = self.fixed;
		}
		if ( !self.derived ){
			self._createGroup('derived');
			self.derived = self._getGroup('derived') as GrobGroupDerived;	
		}else{
			self.data['derived'] = self.derived;
		}

		// For all groups 
		for(const group_key in (self as any).data ){
			const group = (self as any).data[group_key];
			group.parent = self;

			for(const col_key in (group as any).collections_names ){
				const collection : GrobCollection<GrobNodeType> = group.collections_names[col_key];
				collection.parent = group;
				group.collections_names[collection.getName()] = collection;

				for( const node_key in (collection as any).nodes_names ){
					const node = (collection as any).nodes_names[node_key];
					node.parent = collection;
					collection.nodes_names[node.getName()] = node;

					const origins : GrobDerivedOrigin[] = node.origins ?? [];
					origins.forEach( origin  => {
						let keys = origin.originKey.split('.');
						const target = self.getNode(keys[0] as any,keys[1],keys[2])
						origin.origin = target;

						node.addDependency(target)
					})
				}
			}
		}
		const groups = Object.values((self as any).data); 
	}
})
export class TTRPGSystemJSONFormatting extends TTRPGSystemGraphModel {
	  
	@JsonClassTyped ( GrobGroupFixed , {preSerializationConversion : true})
	public fixed 	: GrobGroupFixed	;

	@JsonClassTyped ( GrobGroupDerived , {preSerializationConversion : true})
	public derived 	: GrobGroupDerived	;

	@JsonString()
	@JsonString({scheme:[TTRPG_SCHEMES.GRAPH,TTRPG_SCHEMES.PREVIEW]})
	public author : string = "";

	@JsonString()
	@JsonString({scheme:[TTRPG_SCHEMES.GRAPH,TTRPG_SCHEMES.PREVIEW]})
	public version: string = "";
	
	@JsonString()
	@JsonString({scheme:[TTRPG_SCHEMES.GRAPH,TTRPG_SCHEMES.PREVIEW]})
	public systemCodeName:string = PluginHandler.uuidv4();
	
	@JsonString()
	@JsonString({scheme:[TTRPG_SCHEMES.GRAPH,TTRPG_SCHEMES.PREVIEW]})
	public systemName:string = "";
	
	public constructor(){
		super(); 
	}

}


