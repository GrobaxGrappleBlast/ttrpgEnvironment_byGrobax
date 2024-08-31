 
import { GrobCollection , GrobGroup , type GrobNodeType , GrobDerivedNode, GrobDerivedOrigin, GrobFixedNode, TTRPGSystem , uuidv4 } from "ttrpg-system-graph";
import { JsonObject, JsonMappingRecordInArrayOut, JsonClassTyped, JsonString, JsonNumber, JsonArrayClassTyped } from "grobax-json-handler";
import { BASE_SCHEME } from "grobax-json-handler";
 

// if something is AGraphItem 
/*
@JsonString() 
public name ;
*/
// origins
export class GrobJDerivedOrigin extends GrobDerivedOrigin { 
	@JsonString()
	public symbol: string; 
	
	@JsonString()
	public originKey: string ;
}

 
// NODES  
export class GrobJDerivedNode extends GrobDerivedNode {
	@JsonString() 
	public name ;

	@JsonString({name : 'calculationString'})
	public calc:string;

	@JsonArrayClassTyped(GrobJDerivedOrigin,{name:'calcOrigins'})
	public origins : GrobJDerivedOrigin[];
} 
export class GrobJFixedNode extends GrobFixedNode {

	@JsonString() 
	public name ;

	@JsonNumber({name : 'standardValue'})
	public ___value:number
}
export type GrobJNodeType = GrobJDerivedNode | GrobJFixedNode;

 

//  COLLECTIONS 
export class GrobCollectionDerived extends GrobCollection<GrobJDerivedNode>{ 
	@JsonString() 
	public name ;
	
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName', name:'data',type:GrobJDerivedNode })
	nodes_names: Record<string, GrobJDerivedNode> = {}
} 
export class GrobCollectionFixed extends GrobCollection<GrobJFixedNode>{

	@JsonString() 
	public name ;

	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName', name:'data',type:GrobJFixedNode  })
	nodes_names: Record<string, GrobJFixedNode> = {}
}





//  GROUPS 
export class GrobGroupDerived extends GrobGroup<GrobDerivedNode>{
	
	@JsonString() 
	public name ;

	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName', name:'data',type :GrobCollectionDerived  })
	collections_names: Record<string, GrobCollectionDerived > = {};

} 
export class GrobGroupFixed extends GrobGroup<GrobFixedNode>{
	
	@JsonString() 
	public name ;

	@JsonMappingRecordInArrayOut({KeyPropertyName:'getName', name:'data', type :GrobCollectionFixed  })
	collections_names: Record<string,GrobCollectionFixed> = {};

}





 
export class TTRPG_SCHEMES { 
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
export class TTRPGSystemJSONFormatting extends TTRPGSystem {
	  
	@JsonClassTyped ( GrobGroupFixed )
	public fixed 	: GrobGroupFixed	;

	@JsonClassTyped ( GrobGroupDerived )
	public derived 	: GrobGroupDerived	;

	@JsonString()
	@JsonString({scheme:[BASE_SCHEME,TTRPG_SCHEMES.PREVIEW]})
	public author : string = "";

	@JsonString()
	@JsonString({scheme:[BASE_SCHEME,TTRPG_SCHEMES.PREVIEW]})
	public version: string = "";
	
	@JsonString()
	@JsonString({scheme:[BASE_SCHEME,TTRPG_SCHEMES.PREVIEW]})
	public systemCodeName:string = uuidv4();
	
	@JsonString()
	@JsonString({scheme:[BASE_SCHEME,TTRPG_SCHEMES.PREVIEW]})
	public systemName:string = "";
	
	public constructor(){
		super(); 
	}

}


