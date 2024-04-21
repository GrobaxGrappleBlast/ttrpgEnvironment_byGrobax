import type { IOutputHandler } from "../../Abstractions/IOutputHandler";
import { TTRPGSystemGraphModel } from "../../GraphV2/TTRPGSystemGraphModel";
import type { GrobNodeType } from "../../GraphV2/TTRPGSystemsGraphDependencies";
import type { GrobCollection, GrobCollectionType } from "../../GrobCollection";
import type { GrobGroup, GrobGroupType } from "../../GrobGroup";
import { GrobDerivedNode, GrobDerivedOrigin } from "../../GrobNodte";
 

var out = {
	errorMessages: [],
	logMessages: [],
	outError: function (msg: any) {
		this.errorMessages.push(msg);
		//console.log('ERROR :' + msg);
	},
	outLog: function (msg: any) {
		this.logMessages.push(msg);
		//console.log('LOG :' + msg);
	},
	clean: function (): void {
		this.errorMessages	= [];
		this.logMessages	= [];
	}
}
 
function setupTest() : IGraphAbstractModel | TTRPGSystemGraphModel{
	let sys = new TTRPGSystemGraphModel();
	sys.setOut(out);
	out.clean();
	function createFunctions( group ){
		for (let c = 0; c < 5; c++){
			const colName = (c+1) + 'c';
			const collection = sys.createCollection(group,colName)
			for (let i = 0; i < 5; i++) {
				sys.createNode(group,colName,(i+1)+'n');
			} 
		}
	}
	createFunctions('derived');
	createFunctions('fixed');
	//@ts-ignore
	return sys as IGraphAbstractModel;
}


interface IGraphAbstractModel {
	 
	data : Record< string , GrobGroup<GrobNodeType> > ;
	
	setOut					( out : IOutputHandler | null  ):void 
	_deleteGroup			( group:GrobGroupType | string  ) :void
	_createGroup			( name:string ) :  GrobGroup<GrobNodeType> 
	_hasGroup				( name:string ) : boolean
	_getGroup_key 			( key:string ) : GrobGroupType
	_getGroup( name ) : GrobGroupType
	 _deleteCollection		( collection:GrobCollectionType ) : boolean  
	_createCollection		( group:GrobGroupType , name:string   ) :GrobCollection<GrobNodeType>
	_deleteNode				( node: GrobNodeType ) : boolean
	_addNodeDependency		( node: GrobDerivedNode, dep : GrobNodeType ) :boolean
	_removeNodeDependency	( node: GrobDerivedNode, dep:GrobNodeType ) :boolean
}

test('Try to Get Groups and Collections and nodes that does not exist', () => {
	
	let sys  :TTRPGSystemGraphModel = setupTest() as TTRPGSystemGraphModel;
	//@ts-ignore
	let asys :IGraphAbstractModel 	= sys as IGraphAbstractModel;

	let group = asys._getGroup('TryGroup');
	expect(group).toBeFalsy();

	let col = sys.getCollection('derived','TryCol')
	expect(col).toBeFalsy();

	let node = sys.getNode('derived','1c','tryGetNode');
	expect(node).toBeFalsy();

})

test('Get Placement key from Unparented node', () => {
	
	// @ts-ignore
	const node = new GrobDerivedNode('trythis', {}  );

	const locKey = node.getLocationKey();
	const locKeySeg = node.getLocationKeySegments(); 
	expect(locKey).toEqual('unknown.unknown.trythis')
	expect(locKeySeg[0]).toEqual('unknown')
	expect(locKeySeg[1]).toEqual('unknown')
	expect(locKeySeg[2]).toEqual('trythis')

})