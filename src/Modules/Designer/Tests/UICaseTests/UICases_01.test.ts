import exp from "constants";
import type { IOutputHandler } from "../../Abstractions/IOutputHandler";
import { TTRPGSystem } from "../../index";
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
function startTest2(){
	let sys = new TTRPGSystem();
	sys.initAsNew();
	sys.setOut(out);
	out.clean();

	function createDerivedFunctions(){
		for (let c = 0; c < 1; c++){
			const colName =  'c'+(c+1);
			sys.createDerivedCollection(colName)

			for (let i = 0; i < 5; i++) {
				sys.createDerivedNode(colName,'n'+(i+1)); 
			}
		}
	}
	function createfixedFunctions(){
		for (let c = 0; c < 2; c++){
			const colName = 'c'+(c+1);
			sys.createFixedCollection(colName)
			
			for (let i = 0; i < 2; i++) {
				sys.createFixedNode(colName,'n'+(i+1)); 
			}
		}
	}

	createDerivedFunctions();
	createfixedFunctions();
	return sys;
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
