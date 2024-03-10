

import { OrganisedTTPRPGSystemStructure } from "../../../../../src/Modules/Graph/OrganisedTTPRPGSystemStructure";
import type { IOutputHandler } from "../../IOutputHandler";
import { derivedNode, fixedNode } from "../../Nodte";
 

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
		console.log('ERROR :' + msg);
	},
	outLog: function (msg: any) {
		this.logMessages.push(msg);
		console.log('LOG :' + msg);
	},
	clean: function (): void {
		this.errorMessages	= [];
		this.logMessages	= [];
	}
}
test(' tests some base functionality ', () => {
	let sys = new OrganisedTTPRPGSystemStructure();
	let r 

	r = sys.isOfTypeASystemKeys('fixed');
	expect(r).toBe(true);

	r = sys.isOfTypeASystemKeys('derived');
	expect(r).toBe(true);
	
	r = sys.isOfTypeASystemKeys('static');
	expect(r).toBe(false);
	
	r = sys.isOfTypeASystemKeys('Fixed');
	expect(r).toBe(false);
	
	r = sys.isOfTypeASystemKeys('fixed ');
	expect(r).toBe(false);
	
	r = sys.isOfTypeASystemKeys(' fixed');
	expect(r).toBe(false);
	
	r = sys.isOfTypeASystemKeys('fixed.');
	expect(r).toBe(false);

})

test(' Graph Create and Get', () => {
	
	
	let sys = new OrganisedTTPRPGSystemStructure();
	out.clean();

	sys.createNode('derived','my1Col','My1Node', out);
	sys.createNode('derived','my1Col','My2Node', out);
	sys.createNode('derived','my1Col','My3Node', out);
	sys.createNode('derived','my1Col','My4Node', out);
	sys.createNode('derived','my1Col','My5Node', out);

	sys.createNode('derived','my2Col','My1Node', out);
	sys.createNode('derived','my2Col','My2Node', out);
	sys.createNode('derived','my2Col','My3Node', out);
	sys.createNode('derived','my2Col','My4Node', out);
	sys.createNode('derived','my2Col','My5Node', out);

	sys.createNode('derived','my3Col','My1Node', out);
	sys.createNode('derived','my3Col','My2Node', out);
	sys.createNode('derived','my3Col','My3Node', out);
	sys.createNode('derived','my3Col','My4Node', out);
	sys.createNode('derived','my3Col','My5Node', out);

	sys.createNode('derived','my4Col','My1Node', out);
	sys.createNode('derived','my4Col','My2Node', out);
	sys.createNode('derived','my4Col','My3Node', out);
	sys.createNode('derived','my4Col','My4Node', out);
	sys.createNode('derived','my4Col','My5Node', out);

	sys.createNode('derived','my5Col','My1Node', out);
	sys.createNode('derived','my5Col','My2Node', out);
	sys.createNode('derived','my5Col','My3Node', out);
	sys.createNode('derived','my5Col','My4Node', out);
	sys.createNode('derived','my5Col','My5Node', out);

	sys.createNode('fixed','my1Col','My1Node',out);
	sys.createNode('fixed','my1Col','My2Node',out);
	sys.createNode('fixed','my1Col','My3Node',out);
	sys.createNode('fixed','my1Col','My4Node',out);
	sys.createNode('fixed','my1Col','My5Node',out);
	
	sys.createNode('fixed','my2Col','My1Node',out);
	sys.createNode('fixed','my2Col','My2Node',out);
	sys.createNode('fixed','my2Col','My3Node',out);
	sys.createNode('fixed','my2Col','My4Node',out);
	sys.createNode('fixed','my2Col','My5Node',out);
	
	sys.createNode('fixed','my3Col','My1Node',out);
	sys.createNode('fixed','my3Col','My2Node',out);
	sys.createNode('fixed','my3Col','My3Node',out);
	sys.createNode('fixed','my3Col','My4Node',out);
	sys.createNode('fixed','my3Col','My5Node',out);
	
	sys.createNode('fixed','my4Col','My1Node',out);
	sys.createNode('fixed','my4Col','My2Node',out);
	sys.createNode('fixed','my4Col','My3Node',out);
	sys.createNode('fixed','my4Col','My4Node',out);
	sys.createNode('fixed','my4Col','My5Node',out);
	
	sys.createNode('fixed','my5Col','My1Node',out);
	sys.createNode('fixed','my5Col','My2Node',out);
	sys.createNode('fixed','my5Col','My3Node',out);
	sys.createNode('fixed','my5Col','My4Node',out);
	sys.createNode('fixed','my5Col','My5Node',out);
	

	var getNode;

	function testGroupColNode_exspectFALSE(group, col, node, out){
		getNode = sys.getNode(group,col,node, out);	
		expect(getNode).toBe(undefined)

		expect(out.errorMessages.length ).toBe( 1 );
		out.clean();
	}
	function testGroupColNode(group, col, node, out){
		 
			getNode = sys.getNode(group,col,node, out);	
			expect(getNode?.name).toBe(node)
			expect(getNode?.parent.name).toBe(col)
			expect(getNode?.parent.parent.name).toBe(group)
	 
	}
	// derived
		// first collection 
			// first item
			testGroupColNode('derived','my1Col','My1Node',out)
			// mid item
			testGroupColNode('derived','my1Col','My3Node',out)
			// last item
			testGroupColNode('derived','my1Col','My5Node',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('derived','my1Col','0',out)

		// MID collection 
			// first item
			testGroupColNode('derived','my3Col','My1Node',out)
			// mid item
			testGroupColNode('derived','my3Col','My3Node',out)
			// last item
			testGroupColNode('derived','my3Col','My5Node',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('derived','my3Col','0',out)

		// LAST collection 
			// first item
			testGroupColNode('derived','my5Col','My1Node',out)
			// mid item
			testGroupColNode('derived','my5Col','My3Node',out)
			// last item
			testGroupColNode('derived','my5Col','My5Node',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('derived','my3Col','0',out)
	// fixed
		// first collection 
			// first item
			testGroupColNode('fixed','my1Col','My1Node',out)
			// mid item
			testGroupColNode('fixed','my1Col','My3Node',out)
			// last item
			testGroupColNode('fixed','my1Col','My5Node',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('derived','my1Col','0',out)

		// MID collection 
			// first item
			testGroupColNode('fixed','my3Col','My1Node',out)
			// mid item
			testGroupColNode('fixed','my3Col','My3Node',out)
			// last item
			testGroupColNode('fixed','my3Col','My5Node',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('derived','my3Col','0',out)

		// LAST collection 
			// first item
			testGroupColNode('fixed','my5Col','My1Node',out)
			// mid item
			testGroupColNode('fixed','my5Col','My3Node',out)
			// last item
			testGroupColNode('fixed','my5Col','My5Node',out)
			// exspect undefined and an Error Message
			testGroupColNode_exspectFALSE('fixed','my3Col','0',out)


})
