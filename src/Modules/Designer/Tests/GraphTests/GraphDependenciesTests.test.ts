
import { TTRPGSystem } from "../../index";


 
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
	let sys = new TTRPGSystem();
	sys.initAsNew();
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

test('dependency, create check dependent and dependency', () => {
	
	let sys = setupTest();
	let der1 = sys.getDerivedNode('1c','1n');
	let fix1 = sys.getFixedNode('1c','1n');
	
	sys.addNodeDependency(der1,fix1);

	expect( der1.dependencies[fix1.getKey()].getName() ).toBe(fix1.getName());
	expect( fix1.dependents[der1.getKey()].getName() ).toBe(der1.getName());
	
	sys.removeNodeDependency(der1,fix1);

	expect( der1.dependencies[fix1.getKey()] ?? null ).toBe(null);
	expect( fix1.dependents[der1.getKey()] ?? null ).toBe(null);

})


