

import { OrganisedTTPRPGSystemStructure } from "../../../../../src/Modules/Graph/OrganisedTTPRPGSystemStructure";
import { Collection } from "../../Collection";
import { Group } from "../../Group";
import type { IOutputHandler } from "../../IOutputHandler";
import { derivedNode, fixedNode, type NodeType } from "../../Nodte";
 

interface TestIOutputHandler extends IOutputHandler{
	errorMessages 	:string[],
	logMessages 	:string[],
	clean : () => void
}
var out : TestIOutputHandler ={
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

test('data is consistent1', () => {
	return
	let sys = new OrganisedTTPRPGSystemStructure();
	out.clean();
 
	// testing that the dependencies are added correctly and that we can get then in every way possible
	sys.createNode('derived','my1Col','My1Node', out);
 
	ensureExistsOuter('derived','my1Col','My1Node');
	function ensureExistsOuter( gName, cName, nName){
		
		let n = sys.getNode(gName,cName,nName) as derivedNode;
		let segs = n.getKeySegments();

		function innerDo( gName, cName, nName){
			let isFound = false;
			try{
				let a =	(((sys[gName] as Group<derivedNode>).collections[cName] as Collection<derivedNode> ).nodes[nName] as derivedNode);
				if(a.name == nName)
					isFound = true
			}
			catch(e){
				isFound =false;
			} 
			expect(isFound).toBe(true);
		}
		
		innerDo(gName,cName,nName);
		innerDo(segs[0],segs[1],segs[2]);
	}

	let node 	= sys.getNode('derived','my1Col','My1Node', out) as derivedNode;
	node.name = 'MyNewName'	
	sys.updateNode('derived','my1Col','My1Node',node,out);

	ensureExistsOuter('derived','my1Col','MyNewName');

})
test('data is consistent', () => {
	return
	let sys = new OrganisedTTPRPGSystemStructure();
	out.clean();

	sys.createNode('fixed','my1Col','My1Node',out);
	sys.createNode('fixed','my1Col','My2Node',out);
	sys.createNode('fixed','my1Col','My3Node',out);
	sys.createNode('fixed','my1Col','My4Node',out);
	sys.createNode('fixed','my1Col','My5Node',out);

	// testing that the dependencies are added correctly and that we can get then in every way possible
	sys.createNode('derived','my1Col','My1Node', out);

	ensureExistsOuter('fixed','my1Col','My1Node');
	ensureExistsOuter('fixed','my1Col','My2Node');
	ensureExistsOuter('fixed','my1Col','My3Node');
	ensureExistsOuter('fixed','my1Col','My4Node');
	ensureExistsOuter('fixed','my1Col','My5Node');
	ensureExistsOuter('derived','my1Col','My1Node');
	function ensureExistsOuter( gName, cName, nName){
		
		let n = sys.getNode(gName,cName,nName) as derivedNode;
		let segs = n.getKeySegments();

		function innerDo( gName, cName, nName){
			let isFound = false;
			try{
				let a =	(((sys[gName] as Group<derivedNode>).collections[cName] as Collection<derivedNode> ).nodes[nName] as derivedNode);
				if(a.name == nName)
					isFound = true
			}
			catch(e){
				isFound =false;
			} 
			expect(isFound).toBe(true);
		}
		
		innerDo(gName,cName,nName);
		innerDo(segs[0],segs[1],segs[2]);
	}

	let node 	= sys.getNode('derived','my1Col','My1Node', out) as derivedNode;
	node.name = 'MyNewName'	
	sys.updateNode('derived','my1Col','My1Node',node,out);

	ensureExistsOuter('derived','my1Col','MyNewName');

})
test(' Dependencies updates, Records And DerivedNodtes ', () => {
	 
	let sys = new OrganisedTTPRPGSystemStructure();
	out.clean();

	sys.createNode('fixed','my1Col','My1Node',out);
	sys.createNode('fixed','my1Col','My2Node',out);
	sys.createNode('fixed','my1Col','My3Node',out);
	sys.createNode('fixed','my1Col','My4Node',out);
	sys.createNode('fixed','my1Col','My5Node',out);

	// testing that the dependencies are added correctly and that we can get then in every way possible
	sys.createNode('derived','my1Col','My1Node', out);
	let node 	= sys.getNode('derived','my1Col','My1Node', out) as derivedNode;	
	let nodeDep1= sys.getNode('fixed','my1Col','My1Node', out) as fixedNode;	
	let nodeDep2= sys.getNode('fixed','my1Col','My2Node', out) as fixedNode;	 

	node.addDependency(nodeDep1);//?.dependencies.push(nodeDep1);
	node.addDependency(nodeDep2);//?.dependencies.push(nodeDep2);
	sys.updateNode('derived','my1Col','My1Node',node,out);
 
	let expectedDeps = {};
	expectedDeps[nodeDep1.getKey()] = nodeDep1;
	expectedDeps[nodeDep2.getKey()] = nodeDep2;

	let expectedSelfDep = {}
	expectedSelfDep[node.getKey()] = node;
	
	// test through instances 
	expect(node.dependencies).toEqual(expectedDeps);
	expect(nodeDep1.dependents).toEqual(expectedSelfDep);
	expect(nodeDep2.dependents).toEqual(expectedSelfDep);
	
	// test through sys
	// an array of dependencies are exspected
	expect(sys.dependencyGraph_outgoing [node.getKey()]).toEqual(Object.values(expectedDeps));  
	expect( sys.dependencyGraph_ingoing[node.getKey()] ?? [] ).toEqual([]);

	// update the Node Name and test everything again!
	node.name = 'MyNewName'
	sys.updateNode('derived','my1Col','My1Node',node,out);

	// test through instances 
	expect(node.dependencies).toEqual(expectedDeps);

	// reset what we exspect
	expectedSelfDep = {}
	expectedSelfDep[node.getKey()] = node;

	expect(nodeDep1.dependents).toEqual(expectedSelfDep);
	expect(nodeDep2.dependents).toEqual(expectedSelfDep);
	
	// test through sys
	expect(sys.dependencyGraph_outgoing[node.getKey()]).toEqual(Object.values(expectedDeps));
	expect(sys.dependencyGraph_ingoing[node.getKey()] ?? []).toEqual([]);// who depends on this. no one.


})

