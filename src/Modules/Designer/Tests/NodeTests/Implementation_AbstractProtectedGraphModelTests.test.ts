import exp from "constants";
import type { IOutputHandler } from "../../Abstractions/IOutputHandler";
import { TTRPGSystemGraphModel } from "../../GraphV2/TTRPGSystemGraphModel";
import type { GrobNodeType } from "../../GraphV2/TTRPGSystemsGraphDependencies";
import type { GrobCollection, GrobCollectionType } from "../../GrobCollection";
import type { GrobGroup, GrobGroupType } from "../../GrobGroup";
import { GrobDerivedNode, GrobDerivedOrigin } from "../../GrobNodte";

interface TestIOutputHandler extends IOutputHandler{
	errorMessages 	:string[],
	logMessages 	:string[],
	clean : () => void
}
var out : TestIOutputHandler = {
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

function startTest(){
	let sys = new TTRPGSystemGraphModel();
	sys.setOut(out);
	out.clean(); 
	return sys;
}


function startTest2(){
	let sys = new TTRPGSystemGraphModel();
	sys.setOut(out);
	out.clean();

	function createDerivedFunctions(){
		for (let c = 0; c < 5; c++){
			const colName =  'c'+(c+1);
			sys.createDerivedCollection(colName)

			for (let i = 0; i < 5; i++) {
				sys.createDerivedNode(colName,'n'+(i+1)); 
			}
		}
	}
	function createfixedFunctions(){
		for (let c = 0; c < 6; c++){
			const colName = 'c'+(c+1);
			sys.createFixedCollection(colName)
			
			for (let i = 0; i < 6; i++) {
				sys.createFixedNode(colName,'n'+(i+1)); 
			}
		}
	}

	createDerivedFunctions();
	createfixedFunctions();
	return sys;
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

test('Test Deleted node', () => {
	let sys = startTest2();
	let dn1 = sys.getDerivedNode('c1','n1')

	let fn1 = sys.getFixedNode('c1','n1')
	let fn1keys = fn1.getLocationKeySegments();
 
	// set Node dependency
	dn1.setCalc('@a');
	dn1.setOrigin('@a',fn1)


	let fn1_try =  sys.getNode(fn1keys[0] as any,fn1keys[1],fn1keys[2]);
	expect(fn1_try).toEqual(fn1_try);

	// so now When we delete we can check if the nodes are deleted, 
	// and if the dependencies are null
	// and if the collection is removed 

	// DELETE
	sys.deleteFixedNode( fn1.parent.getName(), fn1.getName() )

	// NODE IS GONE ASSRANCE 
		expect(dn1.origins.length == 1) 
		expect(dn1.origins[0].origin).toBe(null);
		expect(Object.keys(dn1.dependencies).length == 0) 

		let orig = dn1.origins.find(p => p.symbol == '@a') as GrobDerivedOrigin;
		expect(orig.origin ).toBeFalsy();
		
		// all the settings on the Node thats deleted should be null or empty
		expect(fn1.dependencies).toEqual({})
		expect(fn1.dependents).toEqual({})
		expect(fn1.parent).toBe(null);
		
});

test('Test Deleted Collection', () => {
	let sys = startTest2();
	let dn1 = sys.getDerivedNode('c1','n1')

	let fn1 = sys.getFixedNode('c1','n1')
	let fn1keys = fn1.getLocationKeySegments();

	let dc1 = sys.getDerivedCollection('c1')
	let fc1 = sys.getFixedCollection('c1')
	
	// set Node dependency
	dn1.setCalc('@a');
	dn1.setOrigin('@a',fn1)


	let fn1_try =  sys.getNode(fn1keys[0] as any,fn1keys[1],fn1keys[2]);
	expect(fn1_try).toEqual(fn1_try);

	// so now When we delete we can check if the nodes are deleted, 
	// and if the dependencies are null
	// and if the collection is removed 

	// DELETE
	sys.deleteFixedCollection(fc1)

	// NODE IS GONE ASSRANCE
		expect(sys.getFixedCollection('c1') == null ).toBe(true);
		expect(dn1.origins.length == 1) 
		expect(dn1.origins[0].origin).toBe(null);
		expect(Object.keys(dn1.dependencies).length == 0) 

		let orig = dn1.origins.find(p => p.symbol == '@a') as GrobDerivedOrigin;
		expect(orig.origin ).toBeFalsy();
		
		// all the settings on the Node thats deleted should be null or empty
		expect(fn1.dependencies).toEqual({})
		expect(fn1.dependents).toEqual({})
		expect(fn1.parent==null).toBe(true);
		
		//Now we can no longer Find the collection
		expect(sys.getCollection('fixed','c1'))
		fn1_try =  sys.getNode(fn1keys[0] as any,fn1keys[1],fn1keys[2]);
		expect(fn1_try==null).toBe(true)

	// Collection DELETE ASSURANCE
		expect(Object.keys(fc1.nodes_keys).length).toBe(0)
		expect(Object.keys(fc1.nodes_names).length).toBe(0)
		expect(fc1.parent==null).toBe(true)
 
});

test('Test Group Deletion', () => {
	let sys : IGraphAbstractModel | TTRPGSystemGraphModel = startTest2();
	let dn1 = sys.getDerivedNode('c1','n1')

	let fn1 = sys.getFixedNode('c1','n1')
	let fn1keys = fn1.getLocationKeySegments();

	let dc1 = sys.getDerivedCollection('c1')
	let fc1 = sys.getFixedCollection('c1')
	
	//@ts-ignore
	let fg1 = (sys  as IGraphAbstractModel)._getGroup('fixed');

	// set Node dependency
	dn1.setCalc('@a');
	dn1.setOrigin('@a',fn1)
 
	let fn1_try =  sys.getNode(fn1keys[0] as any,fn1keys[1],fn1keys[2]);
	expect(fn1_try).toEqual(fn1);

	// so now When we delete we can check if the nodes are deleted, 
	// and if the dependencies are null
	// and if the collection is removed 
	
	// DELETE
	//@ts-ignore
	(sys as IGraphAbstractModel)._deleteGroup('fixed');

	// NODE IS GONE ASSRANCE
		expect(sys.getFixedCollection('c1')==null).toBe(true);
		expect(dn1.origins.length == 1) 
		expect(dn1.origins[0].origin == null).toBe(true);
		expect(Object.keys(dn1.dependencies).length == 0) 

		let orig = dn1.origins.find(p => p.symbol == '@a') as GrobDerivedOrigin;
		expect(orig.origin == null).toBe(true);
		
		// all the settings on the Node thats deleted should be null or empty
		expect(fn1.dependencies).toEqual({})
		expect(fn1.dependents).toEqual({})
		expect(fn1.parent == null ).toBe(true);
		expect(fn1.getDependencies().length).toBe(0)
		expect(fn1.getDependents().length).toBe(0)

		
		//Now we can no longer Find the collection
		expect(sys.getCollection('fixed','c1'))
		fn1_try =  sys.getNode(fn1keys[0] as any,fn1keys[1],fn1keys[2]);
		expect(fn1_try == null).toBe(true)

	// Collection DELETE ASSURANCE
		expect(Object.keys(fc1.nodes_keys).length).toBe(0)
		expect(Object.keys(fc1.nodes_names).length).toBe(0)
		expect(fc1.parent == null ).toBe(true)

	// Group Deletion Assurance
		expect(Object.keys(fg1.collections_keys).length).toBe(0)
		expect(Object.keys(fg1.collections_names).length).toBe(0)

		// @ts-ignore
		let fixedGroupTry = (sys as IGraphAbstractModel)._getGroup('fixed') ;
		expect(fixedGroupTry ).toBeFalsy()
	
});


