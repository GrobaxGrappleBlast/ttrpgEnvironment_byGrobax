import type { GrobNodeType } from "src/Modules/Designer/GraphV2/TTRPGSystemsGraphDependencies";
import type { IOutputHandler } from "../../Abstractions/IOutputHandler";
import { TTRPGSystemGraphModel } from "../../GraphV2/TTRPGSystemGraphModel";
import { GrobCollection } from "../../GrobCollection";
import { GrobDerivedNode, GrobFixedNode } from "../../GrobNodte";
import exp from "constants";

 
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
 
function setupTest(){
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
	return sys;
}

test('Calculate the first node', () => {
	
	// setup
	let sys = setupTest();
	let der1 = sys.getDerivedNode('1c','1n');
	let fix1 = sys.getFixedNode('1c','1n');

	// add calc
	der1.setCalc('@a - @b + @c',true); 
	expect(der1.origins.length).toBe(3);

	der1.setCalc('@a - @b + @c',true); 
	expect(der1.origins.length).toBe(3);

	der1.setCalc('@a - @b + @c + @a * @a',true); 
	expect(der1.origins.length).toBe(3);

	der1.setCalc('@a - @b + @c + @a * @a - @c ',true); 
	expect(der1.origins.length).toBe(3);

	der1.setCalc( '@a',true); 
	expect(der1.origins.length).toBe(1);

	der1.setCalc('Math.floor((@a - 10)/2);',true); 
	expect(der1.origins.length).toBe(1);
	der1.setOrigin('@a',fix1);

	// test the calculation.
	let calcValue : number = 0;

	fix1.setValue(0);
	der1.recalculate();
	calcValue = der1.getValue();
	expect(calcValue).toBe(-5);

	fix1.setValue(1);
	der1.recalculate();
	calcValue = der1.getValue();
	expect(calcValue).toBe(-5);

	fix1.setValue(2);
	der1.recalculate();
	calcValue = der1.getValue();
	expect(calcValue).toBe(-4);

	fix1.setValue(3);
	der1.recalculate();
	calcValue = der1.getValue();
	expect(calcValue).toBe(-4);

	fix1.setValue(4);
	der1.recalculate();
	calcValue = der1.getValue();
	expect(calcValue).toBe(-3);

	fix1.setValue(5);
	der1.recalculate();
	calcValue = der1.getValue();
	expect(calcValue).toBe(-3);

	fix1.setValue(6);
	der1.recalculate();
	calcValue = der1.getValue();
	expect(calcValue).toBe(-2);

	fix1.setValue(7);
	der1.recalculate();
	calcValue = der1.getValue();
	expect(calcValue).toBe(-2);

	fix1.setValue(8);
	der1.recalculate();
	calcValue = der1.getValue();
	expect(calcValue).toBe(-1);

	fix1.setValue(9);
	der1.recalculate();
	calcValue = der1.getValue();
	expect(calcValue).toBe(-1);

	fix1.setValue(10);
	der1.recalculate();
	calcValue = der1.getValue();
	expect(calcValue).toBe(0);
	
	//sys.addNodeDependency(der1,fix1);

	
})

test('Test Dnd AbilityModifier CalcValues', () => {
	
	// setup
	let sys = setupTest();
	let der1 = sys.getDerivedNode('1c','1n');
	let fix1 = sys.getFixedNode('1c','1n');

	
	der1.setCalc('Math.floor((@a - 10)/2);',true);
	der1.setOrigin('@a',fix1);

	let calcValue:number;
	function testScoreIn_modifierOut( abilityScore, abilityModifier ){
		fix1.setValue(abilityScore);
		der1.recalculate();
		calcValue = der1.getValue();
		expect(calcValue).toBe(abilityModifier);
	} 

	testScoreIn_modifierOut(0 ,-5);
	testScoreIn_modifierOut(1 ,-5);
	testScoreIn_modifierOut(2 ,-4);
	testScoreIn_modifierOut(3 ,-4);
	testScoreIn_modifierOut(4 ,-3);
	testScoreIn_modifierOut(5 ,-3);
	testScoreIn_modifierOut(6 ,-2);
	testScoreIn_modifierOut(7 ,-2);
	testScoreIn_modifierOut(8 ,-1);
	testScoreIn_modifierOut(9 ,-1);
	testScoreIn_modifierOut(10, 0);
	testScoreIn_modifierOut(11, 0);
	testScoreIn_modifierOut(12, 1);
	testScoreIn_modifierOut(13, 1);
	testScoreIn_modifierOut(14, 2);
	testScoreIn_modifierOut(15, 2);
	testScoreIn_modifierOut(16, 3);
	testScoreIn_modifierOut(17, 3);
	testScoreIn_modifierOut(18, 4);
	testScoreIn_modifierOut(19, 4);
	testScoreIn_modifierOut(20, 5);
})

test('Test Dnd AbilityModifier CalcValues _ Exstended', () => {
	
	// setup
	let sys = setupTest();
	let der1 = sys.getDerivedNode('1c','1n');
	let fix1 = sys.getFixedNode('1c','1n');

	// set der1 calc
	der1.setCalc('Math.floor((@a - 10)/2);',true); 
	der1.setOrigin('@a',fix1);

	// set der2 calc
	let der2 = sys.getDerivedNode('1c','2n');
	der2.setCalc( '@a * 2 + @b',true); 

	der2.setOrigin('@a',der1);
	der2.setOrigin('@b',fix1);

	let calcValue:number;
	function testScoreIn_modifierOut( abilityScore, modifier, attackPower ){
		fix1.setValue(abilityScore);
		der1.update( )

		calcValue = der1.getValue();
		expect(calcValue).toBe(modifier);

		calcValue = der2.getValue();
		expect(calcValue).toBe(attackPower);

	} 
	
	testScoreIn_modifierOut(0 ,-5 , (-5 * 2) + 0  );
	testScoreIn_modifierOut(1 ,-5 , (-5 * 2) + 1  );
	testScoreIn_modifierOut(2 ,-4 , (-4 * 2) + 2  );
	testScoreIn_modifierOut(3 ,-4 , (-4 * 2) + 3  );
	testScoreIn_modifierOut(4 ,-3 , (-3 * 2) + 4  );
	testScoreIn_modifierOut(5 ,-3 , (-3 * 2) + 5  );
	testScoreIn_modifierOut(6 ,-2 , (-2 * 2) + 6  );
	testScoreIn_modifierOut(7 ,-2 , (-2 * 2) + 7  );
	testScoreIn_modifierOut(8 ,-1 , (-1 * 2) + 8  );
	testScoreIn_modifierOut(9 ,-1 , (-1 * 2) + 9  );
	testScoreIn_modifierOut(10, 0 , ( 0 * 2) + 10 );
	testScoreIn_modifierOut(11, 0 , ( 0 * 2) + 11 );
	testScoreIn_modifierOut(12, 1 , ( 1 * 2) + 12 );
	testScoreIn_modifierOut(13, 1 , ( 1 * 2) + 13 );
	testScoreIn_modifierOut(14, 2 , ( 2 * 2) + 14 );
	testScoreIn_modifierOut(15, 2 , ( 2 * 2) + 15 );
	testScoreIn_modifierOut(16, 3 , ( 3 * 2) + 16 );
	testScoreIn_modifierOut(17, 3 , ( 3 * 2) + 17 );
	testScoreIn_modifierOut(18, 4 , ( 4 * 2) + 18 );
	testScoreIn_modifierOut(19, 4 , ( 4 * 2) + 19 );
	testScoreIn_modifierOut(20, 5 , ( 5 * 2) + 20 );

})