import { GrobCollection, type GrobCollectionType } from "../GrobCollection";
import { GrobGroup, type GrobGroupType } from "../GrobGroup";
import { newOutputHandler, type IOutputHandler } from "../Abstractions/IOutputHandler"; 
import type { GrobNodeType } from "../GraphV2/TTRPGSystemsGraphDependencies";
import { GrobDerivedNode, GrobDerivedOrigin, GrobFixedNode } from "../GrobNodte";
import { TTRPGSystemGraphAbstractModel } from "../GraphV2/TTRPGSystemGraphAbstractModel"; 
import { JsonProperty,JsonObject, JsonMappingRecordInArrayOut, JsonClassTyped } from "../../JSONModules/index"; 
import { TTRPGSystemGraphModel } from "../GraphV2/TTRPGSystemGraphModel";


 
class GrobCollectionDerived extends GrobCollection<GrobDerivedNode>{
	
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName',name:'data',type:GrobDerivedNode})
	nodes_names: Record<string, GrobDerivedNode> = {}
}

class GrobCollectionFixed extends GrobCollection<GrobFixedNode>{

	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName',name:'data',type:GrobFixedNode})
	nodes_names: Record<string, GrobFixedNode> = {}
}

class GrobGroupDerived extends GrobGroup<GrobDerivedNode>{
	
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName', type :GrobCollectionDerived })
	collections_names: Record<string, GrobCollectionDerived > = {};

}
 
class GrobGroupFixed extends GrobGroup<GrobFixedNode>{
	
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName', type :GrobCollectionFixed })
	collections_names: Record<string,GrobCollectionFixed> = {};

}


/**
 *  handles Model operations and Data Containment, 
 * Ensures that data is maintained, as well as graphlinks
*/
@JsonObject({
	onBeforeSerialization:(self:TTRPGSystemJSONFormatting) => {
		self.fixed		= self._getGroup('fixed')	as GrobGroup<GrobFixedNode>;
		self.derived	= self._getGroup('derived')	as GrobGroup<GrobDerivedNode>;
	},
	onAfterDeSerialization:(self:TTRPGSystemJSONFormatting) => {
		// add derived and fixed to groups
		self.data[self.fixed.getKey()] = self.fixed; 
		self.data[self.derived.getKey()] = self.derived;
		(self as any).fixedKey	 = self.fixed.getKey();
		(self as any).derivedKey = self.derived.getKey();

		// For all groups 
		for(const group_key in (self as any).data ){
			const group = (self as any).data[group_key];
			group.parent = self;

			for(const col_key in (group as any).collections_names ){
				const collection : GrobCollection<GrobNodeType> = group.collections_names[col_key];
				collection.parent = group;
				group.collections_keys[collection.getKey()] = collection;

				for( const node_key in (collection as any).nodes_names ){
					const node = (collection as any).nodes_names[node_key];
					node.parent = collection;
					collection.nodes_keys[node.getKey()] = node;

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
	  
	@JsonClassTyped ( GrobGroupFixed )
	public fixed 	: GrobGroupFixed

	@JsonClassTyped ( GrobGroupDerived )
	public derived 	: GrobGroupDerived

	public constructor(){
		super();
	}
}


