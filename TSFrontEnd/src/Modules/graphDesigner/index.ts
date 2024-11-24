 
import { 
	GrobCollection ,
	GrobGroup ,
	type GrobNodeType ,
	GrobDerivedNode,
	GrobDerivedOrigin,
	GrobFixedNode,
	TTRPGSystem ,
	uuidv4,
	Feature_Multi,
	Feature_Choice,
	Feature_CalcReplacement,
	Feature_StatIncrease_apply,
	Feature,
	IOutputHandler,
	GrobBonusNode,
	Feature_Origin_Node,
	Feature_Origin_Collection
} from "ttrpg-system-graph";
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
	declare public name ;

	@JsonString({name : 'calculationString'})
	declare public calc:string;

	@JsonArrayClassTyped(GrobJDerivedOrigin,{name:'calcOrigins'})
	declare public origins : GrobJDerivedOrigin[];
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
			self.fixed	 = self.getGroup('fixed')	 as GrobGroupFixed	;
		}else{
			self.data['fixed'] = self.fixed;
		}
		if ( !self.derived ){
			self._createGroup('derived');
			self.derived = self.getGroup('derived') as GrobGroupDerived;	
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


	setDefaultValues( defualtValues : {group:string, col:string , key:string , value}[] ){

		let obj = {};
		const groupKey = 'derived';
		const colKeys = Object.keys(this.derived.collections_names);
		for (let c = 0; c < Object.keys(this.derived.collections_names).length; c++) {
			const colKey = colKeys[c];
			const collection = this.derived.collections_names[colKey];

			const nodeKeys = Object.keys(collection.nodes_names);
			for (let i = 0; i < nodeKeys.length; i++) {
				const nodeKey = nodeKeys[i];
				const node = collection.nodes_names[nodeKey];
				
				obj[groupKey +'.'+ colKey +'.'+ nodeKey] = () => node.setValue( node.getValue() ?? 0 )
			}
		}

	}
}


@JsonObject({
	onBeforeSerialization 	: (self) => {},
	onBeforeDeSerialization : (self, JsonObject ) => { 
		console.log(JsonObject['type']);
		switch(JsonObject['type']){
			
			case GrobFeature_Multi.getType() : 
            return new GrobFeature_Multi();
			
			case GrobFeature_Choice.getType() : 
            return new GrobFeature_Choice();
			
			case GrobFeature_CalcReplacement.getType() : 
            return new GrobFeature_CalcReplacement();
			
			case GrobFeature_StatIncrease_apply.getType() : 
            return new GrobFeature_StatIncrease_apply();
			default:
				return self;
		}
	}
})
export class GrobFeature extends Feature implements IFeature{ 
	 
	updateTo(feature: Feature, out: IOutputHandler): boolean { return false }
	remove(sys?: TTRPGSystem | null): boolean { return false }
	apply(sys: TTRPGSystem, ...args: any[]): boolean { return false; }
	disposeNode_fromNode(node: GrobBonusNode) { } 
}
export class GrobFeature_Multi	extends Feature_Multi implements IFeature{

	@JsonArrayClassTyped(GrobFeature,{})
	features : Feature[];

}
export class GrobFeature_Choice extends Feature_Choice implements IFeature{

	@JsonArrayClassTyped(GrobFeature,{})
	features : Feature[];

	@JsonNumber()
	public maxChoices: number;

}
export class GrobFeature_CalcReplacement	extends Feature_CalcReplacement implements IFeature{

	@JsonString()
	calc: string;

	@JsonArrayClassTyped(Feature_Origin_Node, {})
    sources: Feature_Origin_Node[];

}
export class GrobFeature_StatIncrease_apply	extends Feature_StatIncrease_apply implements IFeature{

	@JsonArrayClassTyped(Feature_Origin_Node, {})
	sourceItems: Feature_Origin_Node[];

	@JsonArrayClassTyped(Feature_Origin_Collection, {})
    sourceCollections: Feature_Origin_Collection[];

	@JsonNumber()
    increaseSize: number;

	@JsonNumber()
    increaseNumTargets: number;

}


export interface IFeature {
	type: string;
	name: string;
    text: string;
}
export interface IFeature_Multi extends IFeature {
	features: IFeature[];
}
export interface IFeature_Choice extends IFeature_Multi {
	maxChoices:number ;
}
export interface IFeature_replacement extends IFeature {
	calc:string;
	sources: Feature_Origin_Node[];
}
export interface IFeature_statIncrease extends IFeature {
	calc:string;
	sourceItems:string[];
	sourceCollections:string[];
	increaseSize:number;
	increaseNumTargets:number;
}

export interface IFeatureAllCombined {
	key? : string,
	isValid? :boolean,
	name				: string,
	text				: string,
	type				: string,
	features			?: IFeatureAllCombined[],
	sources				?: Feature_Origin_Node[],
	sourceItems			?: string[],
	sourceCollections	?: string[],
	calc				?: string,
	maxChoices			?: number,
	increaseSize		?: number,
	increaseNumTargets	?: number
}
export type AnyIFeature = IFeature | IFeature_Choice | IFeature_Multi | IFeature_replacement | IFeature_statIncrease;