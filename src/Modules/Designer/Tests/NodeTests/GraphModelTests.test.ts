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


test('Test System lookup', () => {

});


test('Test Deleting Group ', () => {

});

test('Test Deleting Collection ', () => {

});

test('General Tests with Graph and nodes.', () => {

});

