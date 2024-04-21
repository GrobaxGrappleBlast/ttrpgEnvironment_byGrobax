import exp from "constants";
import type { IOutputHandler } from "../../Abstractions/IOutputHandler";
import { TTRPGSystemGraphModel } from "../../GraphV2/TTRPGSystemGraphModel";

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
		for (let c = 0; c < 6; c++){
			const colName = (c+1) + 'c';
			sys.createFixedCollection(colName)
			
			for (let i = 0; i < 6; i++) {
				sys.createFixedNode(colName,(i+1)+'n'); 
			}
		}
	}

	createDerivedFunctions();
	createfixedFunctions();
	return sys;
}

test('Try Test Calculations', () => {
	let sys = startTest();
	let node = sys.getDerivedNode('1c','1n');
	
	// Calculate using Test
	let res : any 
	res = node.testCalculate( '@a + 2'  );
	expect(res?.success).toBe(true);
	expect(res?.value).toBe(3);
	
	res = node.parseCalculationToOrigins('@a + 2' )
	expect(res.symbolsToAdd ).toEqual(['@a']);
	expect(res.symbolsToRem ).toEqual([]);
	
	res = node.testCalculate('@a + @b - 10 + 20' );
	expect(res?.value).toBe(12);
	
	// test that by setting the origins, 
	node.setCalc('@a + @b - 10 + 20', true );
	node.setOrigin('@a',sys.getFixedNode	('1c','2n'))
	node.setOrigin('@b',sys.getDerivedNode	('1c','2n'))
	let isValid = node.isValid();
	expect(isValid).toBe(true);
	expect(node.getDependencies().length).toBe(2);
	expect(node.origins.length).toBe(2);


	// by having dependencies also with calcs. we can determine if the graph works
	let node1 = sys.getFixedNode	('1c','2n');
	let node2 = sys.getDerivedNode	('1c','2n');
	node1.setValue(10);
	node2.setCalc('@a * 2',true);
	node2.setOrigin('@a',node1); 
	node.setCalc('@a + @b');
	node2.update(); 
	let value = node.getValue();
	expect(value).toBe(30);

	// using Temp values
	node1.setValue(10);
	node2.setValue(10);
	node.recalculate(true);

	//@ts-ignore
	node.setOrigin('@b', null )
	expect(node.getDependencies().length).toBe(1);
	isValid = node.isValid();
	expect(isValid).toBe(false);

	node.setCalc('@a + @b + @s + @e', true );
	let node3, node4,node5, node6;
	node3 = sys.getFixedNode	('1c','3n');
	node4 = sys.getFixedNode	('1c','4n');
	node5 = sys.getFixedNode	('1c','5n');
	node6 = sys.getFixedNode	('1c','6n');
	node3.setValue(1);
	node4.setValue(1);
	node5.setValue(1);
	node6.setValue(1);
	let add = false;

	add = node.setOrigin('@a',node3)
	expect(add).toBe(true);
	
	add = node.setOrigin('@b',node4)
	expect(add).toBe(true);
	
	add = node.setOrigin('@s',node5)
	expect(add).toBe(true);
	
	add = node.setOrigin('@e',node6)
	expect(add).toBe(true);
	
	value = node.getValue();
	expect(value).toBe(4);

	node.setCalc('@a + @b', true );
	value = node.getValue();
	expect(value).toBe(2);

	node.setCalc('(10 - 5) / 5', true );
	value = node.getValue();
	expect(value).toBe(1);
});

test('Try Wrong Calculations ', () => {
	let sys = startTest();
	let node = sys.getDerivedNode('1c','1n');
	let node2 = sys.getDerivedNode('1c','2n');
	let value = 0;

	node.setCalc('(10 - a) / 5', true );
	value = node.getValue();
	expect(value).toBeFalsy();

	
	// test where it will throw an exception. when evalling (a is not defined and is not math)
	let res = node.testCalculate('(10 - a) / 5');
	expect(res.success).toBe(false);

	// testing where it isent a number as a result
	res = node.testCalculate('"a" == "b"');
	expect(res.success).toBe(false);

	// get a Real Number
	res = node.testCalculate('(10 - 5) / 5');
	expect(res.success).toBe(true);

	node.setCalc('(10-5)/5',true);
	value = node.getValue();
	expect(value).toBe(1);

	//attempt to set an Origin That isent Defined
	let addO = node.setOrigin('@w',node2);
	expect(addO).toBe(false);
});


test('Try Updating  Node through Dependency Calculations ', () => {
	let sys = startTest();
	let d1 = sys.getDerivedNode('1c','1n');
	let d2 = sys.getDerivedNode('1c','2n');
	let f1 = sys.getFixedNode('1c','1n');
	let value = 0;

	d1.setCalc('@a - @b');
	d1.setOrigin('@a',d2);
	d1.setOrigin('@b',f1);

	d2.setCalc('12 - 10');
	f1.setValue(1);

	value = d1.getValue();
	expect(value).toBe(1);

	// now what happens if the calc is invalid 
	let satCalcWrongly = d1.setCalc('@a - @b + a');
	expect(satCalcWrongly).toBe(false);

	// We force an Error state.
	//@ts-ignore 
	d1.calc = '@a - @b + a'
 
	f1.setValue(1);

	value = d1.getValue();
	expect(value).toBeNaN()
	
});