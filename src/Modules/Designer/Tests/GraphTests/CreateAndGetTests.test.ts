import type { GrobNodeType } from "src/Modules/Designer/GraphV2/TTRPGSystemsGraphDependencies";
import type { IOutputHandler } from "../../Abstractions/IOutputHandler";
import { TTRPGSystemGraphModel } from "../../GraphV2/TTRPGSystemGraphModel";
import { GrobCollection } from "../../GrobCollection";
import { GrobDerivedNode, GrobFixedNode } from "../../GrobNodte";

 

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
 

test(' Graph Create and Get', () => {
	
	let sys = new TTRPGSystemGraphModel();
	sys.setOut(out);
	out.clean();

	function createDerivedFunctions(){
		for (let c = 0; c < 5; c++){
			const colName = (c+1) + 'c';
			sys.createDerivedCollection(colName)

			for (let i = 0; i < 5; i++) {
				sys.createDerivedNode(colName,(i+1)+'n');
				sys.createDerivedNode(colName,(i+1)+'n');
				sys.createDerivedNode(colName,(i+1)+'n');
				sys.createDerivedNode(colName,(i+1)+'n');
				sys.createDerivedNode(colName,(i+1)+'n');
			}
		}
	}
	function createfixedFunctions(){
		for (let c = 0; c < 5; c++){
			const colName = (c+1) + 'c';
			sys.createFixedCollection(colName)
			
			for (let i = 0; i < 5; i++) {
				sys.createFixedNode(colName,(i+1)+'n');
				sys.createFixedNode(colName,(i+1)+'n');
				sys.createFixedNode(colName,(i+1)+'n');
				sys.createFixedNode(colName,(i+1)+'n');
				sys.createFixedNode(colName,(i+1)+'n');
			}
		}
	}

	createDerivedFunctions();
	createfixedFunctions();
		
	var getNode;
	function testFixedColNode_exspectFALSE( col, node, out){
		
		out.clean();
		sys.setOut(out); 
		getNode = sys.getFixedNode(col,node);
		expect(getNode).toBe(null)

		expect(out.errorMessages.length ).toBe( 1 );
		out.clean();
	}
	function testFixedColNode( col, node, out){
		sys.setOut(out);
		getNode = sys.getFixedNode(col,node); 
		expect(getNode?.name).toBe(node)
		expect(getNode?.parent.name).toBe(col)
		expect(getNode?.parent.parent.name).toBe('fixed')
	}

	
	function testDerivedColNode_exspectFALSE( col, node, out){
		
		out.clean();
		sys.setOut(out);
		getNode = sys.getDerivedNode(col,node);
		expect(getNode).toBe(null)

		expect(out.errorMessages.length ).toBe( 1 );
		out.clean();
	}
	function testDerivedColNode( col, node, out){
		  
		sys.setOut(out);
		getNode = sys.getDerivedNode(col,node); 
		expect(getNode?.name).toBe(node)
		expect(getNode?.parent.name).toBe(col)
		expect(getNode?.parent.parent.name).toBe('derived')
	}
	
	// derived
		// first collection 
			// first item
			testDerivedColNode('1c','1n',out)
			// mid item
			testDerivedColNode('1c','2n',out)
			// last item
			testDerivedColNode('1c','2n',out)
			// exspect undefined and an Error Message
			testDerivedColNode_exspectFALSE('1d','0',out)

		// MID collection 
			// first item
			testDerivedColNode('3c','1n',out)
			// mid item
			testDerivedColNode('3c','3n',out)
			// last item
			testDerivedColNode('3c','5n',out)
			// exspect undefined and an Error Message
			testDerivedColNode_exspectFALSE('3c','0',out)

		// LAST collection 
			// first item
			testDerivedColNode('5c','1n',out)
			// mid item
			testDerivedColNode( '5c','3n',out)
			// last item
			testDerivedColNode( '5c','5n',out)
			// exspect undefined and an Error Message
			testDerivedColNode_exspectFALSE('3c','0',out)
	// fixed
		// first collection 
			// first item
			testFixedColNode('1c','1n',out)
			// mid item
			testFixedColNode('1c','3n',out)
			// last item
			testFixedColNode('1c','5n',out)
			// exspect undefined and an Error Message
			testFixedColNode_exspectFALSE('1c','0',out)

		// MID collection 
			// first item
			testFixedColNode( '3c','1n',out)
			// mid item
			testFixedColNode( '3c','3n',out)
			// last item
			testFixedColNode( '3c','5n',out)
			// exspect undefined and an Error Message
			testFixedColNode_exspectFALSE('3c','0',out)

		// LAST collection 
			// first item
			testFixedColNode( '5c','1n',out)
			// mid item
			testFixedColNode( '5c','3n',out)
			// last item
			testFixedColNode( '5c','5n',out)
			// exspect undefined and an Error Message
			testFixedColNode_exspectFALSE( '3c','0',out)


})

 
test(' Graph Create and Get, global calls', () => {
	

	let sys = new TTRPGSystemGraphModel();
	sys.setOut(out);
	out.clean();

	function createFunctions( group ){
		for (let c = 0; c < 5; c++){
			const colName = (c+1) + 'c';
			sys.createCollection(group,colName)

			for (let i = 0; i < 5; i++) {
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
			}
		}
	}
 

	createFunctions('derived');
	createFunctions('fixed');
		
	var getNode;
	function testGroupColNode_exspectFALSE(group, col, node, out){
		
		out.clean();
		sys.setOut(out);
		getNode = sys.getNode(group,col,node);
		expect(getNode).toBe(null)

		expect(out.errorMessages.length ).toBe( 1 );
		out.clean();
	}
	function testGroupColNode(group, col, node, out){

		sys.setOut(out);
		getNode = sys.getNode(group,col,node); 
		expect(getNode?.name).toBe(node)
		expect(getNode?.parent.name).toBe(col)
		expect(getNode?.parent.parent.name).toBe(group)
	}
	
	// derived
		// first collection 
			// first item
			testGroupColNode('derived','1c','1n',out)
			// mid item
			testGroupColNode('derived','1c','2n',out)
			// last item
			testGroupColNode('derived','1c','2n',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('derived','1d','0',out)

		// MID collection 
			// first item
			testGroupColNode('derived','3c','1n',out)
			// mid item
			testGroupColNode('derived','3c','3n',out)
			// last item
			testGroupColNode('derived','3c','5n',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('derived','3c','0',out)

		// LAST collection 
			// first item
			testGroupColNode('derived','5c','1n',out)
			// mid item
			testGroupColNode('derived','5c','3n',out)
			// last item
			testGroupColNode('derived','5c','5n',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('derived','3c','0',out)
	// fixed
		// first collection 
			// first item
			testGroupColNode('fixed','1c','1n',out)
			// mid item
			testGroupColNode('fixed','1c','3n',out)
			// last item
			testGroupColNode('fixed','1c','5n',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('derived','1c','0',out)

		// MID collection 
			// first item
			testGroupColNode('fixed','3c','1n',out)
			// mid item
			testGroupColNode('fixed','3c','3n',out)
			// last item
			testGroupColNode('fixed','3c','5n',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('derived','3c','0',out)

		// LAST collection 
			// first item
			testGroupColNode('fixed','5c','1n',out)
			// mid item
			testGroupColNode('fixed','5c','3n',out)
			// last item
			testGroupColNode('fixed','5c','5n',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('fixed','3c','0',out)


})
 
 
test(' graph Create and Get Collections', () => {
	

	let sys = new TTRPGSystemGraphModel();
	sys.setOut(out);
	out.clean();

	function createFunctions( group ){
		for (let c = 0; c < 5; c++){
			const colName = (c+1) + 'c';
			sys.createCollection(group,colName)

			for (let i = 0; i < 5; i++) {
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
			}
		}
	}
 
	createFunctions('derived');
	createFunctions('fixed');

	let c1_1 : any ;
	let c1_2 : any ;
	let group : 'derived' | 'fixed' = 'derived';
	for (let i = 1; i < 6; i++) { 
		c1_1 = sys.getDerivedCollection(i+'c');
		c1_2 = sys.getCollection(group, i+'c');
		expect(c1_1.name).toBe(c1_2.name)
		expect(c1_1.key).toBe(c1_2.key)
	}
	
	group = 'fixed';
	for (let i = 1; i < 6; i++) { 
		c1_1 = sys.getFixedCollection(i+'c');
		c1_2 = sys.getCollection(group, i+'c');
		expect(c1_1.name).toBe(c1_2.name)
		expect(c1_1.key).toBe(c1_2.key)
	}

	group = 'fixed';
	for (let col = 0; col < 5; col++) {
		const c = (col + 1 ) + 'c';
		for (let n = 0; n < 5; n++) {
			const node = (n+1)+'n';
			c1_1 = sys.getNode(group,c,node);
			c1_2 = sys.getFixedNode(c,node);
			expect(c1_1.name).toBe(c1_2.name)
			expect(c1_1.key).toBe(c1_2.key)
		}
	}

	group = 'derived';
	for (let col = 0; col < 5; col++) {
		const c = (col + 1 ) + 'c';
		for (let n = 0; n < 5; n++) {
			const node = (n+1)+'n';
			c1_1 = sys.getNode(group,c,node);
			c1_2 = sys.getDerivedNode(c,node);
			expect(c1_1.name).toBe(c1_2.name)
			expect(c1_1.key).toBe(c1_2.key)
		}
	}

})


test(' graph Create and Get and Update then GetAgain', () => {

	let sys = new TTRPGSystemGraphModel();
	sys.setOut(out);
	out.clean();

	function createFunctions( group ){
		for (let c = 0; c < 5; c++){
			const colName = (c+1) + 'c';
			sys.createCollection(group,colName)

			for (let i = 0; i < 5; i++) {
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
				sys.createNode(group,colName,(i+1)+'n');
			}
		}
	}
 
	createFunctions('derived');
	createFunctions('fixed');

	let c1_1 : GrobCollection<GrobNodeType> ;
	let c1_2 : GrobCollection<GrobNodeType> ;
	let group : 'derived' | 'fixed' = 'derived';
	for (let i = 1; i < 6; i++) { 
		// get the collection and rename it
		c1_1 = sys.getDerivedCollection(i+'c');
		let name = c1_1.getName().replace('c','collection')
		c1_1.setName(name);

		// get the collection under the new name
		c1_1 = sys.getDerivedCollection(i+'collection');
		c1_2 = sys.getCollection(group, i+'collection') as GrobCollection<GrobNodeType> ;
		
		expect(c1_1.getName()).toBe(c1_2.getName()) 
		expect(c1_1.getName()).toContain(name) 
		expect(c1_1.getKey()).toBe(c1_2.getKey())
	}
	
	group = 'fixed';
	for (let i = 1; i < 6; i++) { 

		// get the collection and rename it
		c1_1 = sys.getFixedCollection(i+'c');
		let name = c1_1.getName().replace('c','collection')
		c1_1.setName(name);
	
		// get the collection under the new name
		c1_1 = sys.getFixedCollection(i+'collection');
		c1_2 = sys.getCollection(group, i+'collection') as GrobCollection<GrobNodeType> ;
		
		expect(c1_1.getName()).toBe(c1_2.getName()) 
		expect(c1_1.getName()).toContain(name)
		expect(c1_1.getKey()).toBe(c1_2.getKey())
	}

	let n1_1 : any ;
	let n1_2 : any ;
	group = 'fixed';
	for (let col = 0; col < 5; col++) {
		const c = (col + 1 ) + 'collection';
		for (let n = 0; n < 5; n++) {

			// get node and rename it
			let nodek = (n+1)+'n';
			n1_1 = sys.getNode(group,c,nodek);
			let name = n1_1.getName().replace('n','node');
			n1_1.setName(name);
			nodek = (n+1)+'node';

			// reget 
			n1_1 = sys.getNode(group,c,nodek);
			n1_2 = sys.getFixedNode(c,nodek);		

			expect(n1_1.name).toBe	(n1_2.name)
			expect(n1_1.getName()).toContain(name) 
			expect(n1_1.key).toBe	(n1_2.key)
		}
	}

	group = 'derived';
	for (let col = 0; col < 5; col++) {
		const c = (col + 1 ) + 'collection';
		for (let n = 0; n < 5; n++) {
			
			// get node and rename it
			let nodek = (n+1)+'n';
			n1_1 = sys.getNode(group,c,nodek);
			let name = n1_1.getName().replace('n','node');
			n1_1.setName(name);
			nodek = (n+1)+'node';

			// reget 
			n1_1 = sys.getNode(group,c,nodek);
			n1_2 = sys.getDerivedNode(c,nodek);		

			expect(n1_1.name).toBe	(n1_2.name) 
			expect(n1_1.getName()).toContain(name) 
			expect(n1_1.key).toBe	(n1_2.key)
		}
	}


})


test(' graph Create and Get And Delete And Get', () => {

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

	let n1_1 : any ;
	let n1_2 : any ;
	let col	 : GrobCollection<GrobNodeType>;
	let group : 'derived' | 'fixed' = 'derived';

	// first add some fixed nodes as dependencies to a derived;
	let fn1 = sys.getFixedNode('1c','1n')
	let fn2 = sys.getFixedNode('1c','1n')
	let dn1 = sys.getDerivedNode('1c','1n')

	dn1.setCalc('@a + @b');
	dn1.setOrigin('@a',fn1,1);
	dn1.setOrigin('@b',fn2,1);


	group = 'fixed';
	// FIXED 
		sys.deleteNode(group ,'1c','1n');
		sys.deleteFixedNode  ('1c','2n');

		// now ensure that the Derived Node has null references to the fixed nodes 
		expect(dn1.getDependencies().length).toBe(0);
		for (let i = 0; i < dn1.origins.length; i++) {
			const orig = dn1.origins[i];
			expect(orig.origin).toBe(null);
		}
		
		expect(sys.hasFixedNode( '1c','1n')).toBe(false);
		expect(sys.hasNode(group,'1c','1n')).toBe(false);
		expect(sys.hasFixedNode( '1c','2n')).toBe(false);
		expect(sys.hasNode(group,'1c','2n')).toBe(false);

		// ensure they cant be retrieved  
		n1_1 = sys.getNode(group,'1c','1n') 
		n1_2 = sys.getFixedNode( '1c','2n') 

		expect(n1_1 == null ).toBe(true ) 
		expect(n1_2 == null ).toBe(true ) 
		expect(sys.hasFixedNode( '1c','1n')).toBe(false);
		expect(sys.hasNode(group,'1c','1n')).toBe(false);
		expect(sys.hasFixedNode( '1c','2n')).toBe(false);
		expect(sys.hasNode(group,'1c','2n')).toBe(false);

		// get collection and ensure they arent in the collection
		col = sys.getFixedCollection('1c') as GrobCollection<GrobFixedNode>;
		expect(sys.hasFixedCollection( '1c')).toBe(true) 
		expect(sys.hasCollection(group,'1c')).toBe(true)
		
		expect(col.hasNode('1n')).toBe(false);
		expect(col.hasNode('2n')).toBe(false);
		expect(col.getNode('1n')).toBe(null);
		expect(col.getNode('2n')).toBe(null);

		// Ensure the collection only have 3 elements now bth in names and keys 
		let names = Object.values	((col as any).nodes_names)
		let keys  = Object.values	((col as any).nodes_keys )
		let nameKeys = Object.keys	((col as any).nodes_names)
		
		expect(names.length).toBe(3);
		expect(keys.length).toBe(3);
		expect(nameKeys).toEqual(['3n','4n','5n']);
		

	
	group = 'derived';

		// add a dependency
		dn1 = sys.getDerivedNode('1c','1n');
		let dn3 = sys.getDerivedNode('1c','3n');
		dn1.setCalc('@a/2');
		dn1.setOrigin('@a',dn3);


		sys.deleteNode(group ,'1c','1n');
		sys.deleteDerivedNode  ('1c','2n');

		// test that dn2 have no reference to dn1 
		expect(dn3.getDependents().length).toBe(0);

		
		expect(sys.hasDerivedNode( '1c','1n')).toBe(false);
		expect(sys.hasNode(group,'1c','1n')).toBe(false);
		expect(sys.hasDerivedNode( '1c','2n')).toBe(false);
		expect(sys.hasNode(group,'1c','2n')).toBe(false);

		// ensure they cant be retrieved  
		n1_1 = sys.getNode(group,'1c','1n') 
		n1_2 = sys.getDerivedNode( '1c','2n') 

		expect(n1_1).toBe(null) 
		expect(n1_2).toBe(null) 
		expect(sys.hasDerivedNode( '1c','1n')).toBe(false);
		expect(sys.hasNode(group,'1c','1n')).toBe(false);
		expect(sys.hasDerivedNode( '1c','2n')).toBe(false);
		expect(sys.hasNode(group,'1c','2n')).toBe(false);

		// get collection and ensure they arent in the collection
		col = sys.getDerivedCollection('1c') as GrobCollection<GrobDerivedNode>;
		expect(sys.hasDerivedCollection( '1c')).toBe(true) 
		expect(sys.hasCollection(group,'1c')).toBe(true)
		
		expect(col.hasNode('1n')).toBe(false);
		expect(col.hasNode('2n')).toBe(false);
		expect(col.getNode('1n')).toBe(null);
		expect(col.getNode('2n')).toBe(null);

		// Ensure the collection only have 3 elements now bth in names and keys 
		names 	 = Object.values((col as any).nodes_names)
		keys  	 = Object.values((col as any).nodes_keys )
		nameKeys = Object.keys	((col as any).nodes_names)
		expect(names.length).toBe(3);
		expect(keys.length).toBe(3);
		expect(nameKeys).toEqual(['3n','4n','5n']);
	
	// Collection delete
		// derived
		expect(sys.hasDerivedCollection( '1c')).toBe(true);
		expect(sys.hasCollection(group,'1c')).toBe(true);

		sys.deleteCollection(group ,'1c' );
		sys.deleteDerivedCollection('2c');
		
		expect(sys.hasCollection	(group,'1c')).toBe(false);
		expect(sys.hasDerivedCollection	  ('2c')).toBe(false);
		names 	 = Object.values((sys as any).derived.collections_names)
		keys 	 = Object.values((sys as any).derived.collections_keys )
		nameKeys = Object.keys	((sys as any).derived.collections_names)

		expect( names.length).toBe(3);
		expect( keys.length ).toBe(3); 
		expect( nameKeys ).toEqual(['3c','4c','5c']);
		
		// fixed
		group = 'fixed';

		expect(sys.hasFixedCollection( '1c')).toBe(true);
		expect(sys.hasCollection(group,'1c')).toBe(true);

		sys.deleteCollection(group ,'1c' );
		sys.deleteFixedCollection('2c');
		
		expect(sys.hasCollection	(group,'1c')).toBe(false);
		expect(sys.hasFixedCollection	  ('2c')).toBe(false);
		names 	 = Object.values((sys as any).derived.collections_names)
		keys 	 = Object.values((sys as any).derived.collections_keys )
		nameKeys = Object.keys	((sys as any).derived.collections_names)
		
		expect( names.length).toBe(3);
		expect( keys.length ).toBe(3); 
		expect( nameKeys ).toEqual(['3c','4c','5c']);
				

})



test('try to add dependency to a Fixed Node', () => {

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

	let node1 = sys.getFixedNode('1c','1n');
	let node2 = sys.getFixedNode('1c','2n');
	let add = node1.addDependency(node2)
	expect(add).toBe(false);

	let rem = node1.removeDependency(node2)
	expect(rem).toBe(false);

})