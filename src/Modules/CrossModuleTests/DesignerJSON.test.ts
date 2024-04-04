import exp from "constants";

import { TTRPGSystemGraphModel } from "../Designer/GraphV2/TTRPGSystemGraphModel";
import { GrobDerivedNode } from "../Designer/GrobNodte";
import type { GrobNodeType } from "../Designer/GraphV2/TTRPGSystemsGraphDependencies";
import { JSONHandler } from "../JSONModules/Decorators";

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

	const Stat_collection = sys.createCollection('fixed','stats')
	sys.createNode('fixed','stats','strength')
	sys.createNode('fixed','stats','dexterity')
	sys.createNode('fixed','stats','constitution')
	sys.createNode('fixed','stats','wisdom')
	sys.createNode('fixed','stats','intelligense')
	sys.createNode('fixed','stats','charisma')
	  
	const Stat_modifier_collection = sys.createCollection('derived','modifiers')
	sys.createNode('derived','modifiers','strength'		)
	sys.createNode('derived','modifiers','dexterity'	)
	sys.createNode('derived','modifiers','constitution'	)
	sys.createNode('derived','modifiers','wisdom'		)
	sys.createNode('derived','modifiers','intelligense'	)
	sys.createNode('derived','modifiers','charisma'		)

	function setModDependency( mod ){
		let node = sys.getNode('derived','modifiers',mod) as GrobDerivedNode;
		let target = sys.getNode('derived','stats',mod) as GrobNodeType;
		node.setCalc("Math.floor((@a - 10)/2))");
		node.setOrigin('@a', target )
	} 
	setModDependency('strength'		)
	setModDependency('dexterity'	)
	setModDependency('constitution'	)
	setModDependency('wisdom'		)
	setModDependency('intelligense'	)
	setModDependency('charisma'		)

	return sys;
}


test('test a Designed Format comes out korrektly', () => {
	
	let sys = setupTest();
	let json = JSONHandler.Serialize(sys); 
	let dsys = JSONHandler.Deserialize(TTRPGSystemGraphModel,json);

	debugger;



})