export const TEST_CONST = 1;

import { TTRPGSystemJSONFormatting } from '../../../../../../../graphDesigner';
import { GrobNodeType, TTRPGSystem } from 'ttrpg-system-graph';
import { DerivedItemController2, originRowDataMin , originRowData} from "./ItemControllers";
import { JSONHandler } from 'grobax-json-handler/dist/JsonHandler';

export function startTest() : TTRPGSystemJSONFormatting{
	const JSON = `{"fixed":{"name":"fixed","data":[{"name":"stats","data":[{"name":"strength","standardValue":1},{"name":"dexterity","standardValue":1},{"name":"constitution","standardValue":1},{"name":"wisdom","standardValue":1},{"name":"intelligence","standardValue":1},{"name":"charisma","standardValue":1},{"name":"Luck","standardValue":0}]},{"name":"SkillProficiencies","data":[{"name":"Athletics","standardValue":0},{"name":"Acrobatics","standardValue":0},{"name":"Sleight of Hand","standardValue":0},{"name":"Arcana","standardValue":0},{"name":"History","standardValue":0},{"name":"Investigation","standardValue":0},{"name":"Nature","standardValue":0},{"name":"Religion","standardValue":0},{"name":"Animal Handling","standardValue":0},{"name":"Insight","standardValue":0},{"name":"Medicine","standardValue":0},{"name":"Perception","standardValue":0},{"name":"Survival","standardValue":0},{"name":"Deception","standardValue":0},{"name":"Intimidation","standardValue":0},{"name":"Performance","standardValue":0},{"name":"Persuasion","standardValue":0}]},{"name":"generic","data":[{"name":"Proficiency Bonus","standardValue":1},{"name":"Hit Points","standardValue":1}]}]},"derived":{"name":"derived","data":[{"name":"modifiers","data":[{"name":"strength","calculationString":"Math.floor((@a-10)/2)","calcOrigins":[{"symbol":"@a","originKey":"fixed.stats.strength"}]},{"name":"dexterity","calculationString":"Math.floor((@a-10)/2)","calcOrigins":[{"symbol":"@a","originKey":"fixed.stats.dexterity"}]},{"name":"constitution","calculationString":"Math.floor((@a-10)/2)","calcOrigins":[{"symbol":"@a","originKey":"fixed.stats.constitution"}]},{"name":"wisdom","calculationString":"Math.floor((@a-10)/2)","calcOrigins":[{"symbol":"@a","originKey":"fixed.stats.wisdom"}]},{"name":"intelligence","calculationString":"Math.floor((@a-10)/2)","calcOrigins":[{"symbol":"@a","originKey":"fixed.stats.intelligence"}]},{"name":"charisma","calculationString":"Math.floor((@a-10)/2)","calcOrigins":[{"symbol":"@a","originKey":"fixed.stats.charisma"}]},{"name":"Luck","calculationString":"@a ","calcOrigins":[{"symbol":"@a","originKey":"fixed.stats.Luck"}]}]},{"name":"skillproficiencyBonus","data":[{"name":"Athletics","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Athletics"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.strength"}]},{"name":"Acrobatics","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Acrobatics"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.dexterity"}]},{"name":"Sleight of Hand","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Sleight of Hand"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.dexterity"}]},{"name":"Arcana","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Arcana"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.intelligence"}]},{"name":"History","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.History"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.intelligence"}]},{"name":"Investigation","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Investigation"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.intelligence"}]},{"name":"Nature","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Nature"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.intelligence"}]},{"name":"Religion","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Religion"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.intelligence"}]},{"name":"Animal Handling","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Animal Handling"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.wisdom"}]},{"name":"Insight","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Insight"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.wisdom"}]},{"name":"Medicine","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Medicine"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.wisdom"}]},{"name":"Perception","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Perception"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.wisdom"}]},{"name":"Survival","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Survival"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.wisdom"}]},{"name":"Deception","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Deception"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.charisma"}]},{"name":"Intimidation","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Intimidation"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.charisma"}]},{"name":"Performance","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Performance"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.charisma"}]},{"name":"Persuasion","calculationString":"@a * @c + @d","calcOrigins":[{"symbol":"@a","originKey":"fixed.SkillProficiencies.Persuasion"},{"symbol":"@c","originKey":"fixed.generic.Proficiency Bonus"},{"symbol":"@d","originKey":"derived.modifiers.charisma"}]}]},{"name":"Spell Bonus","data":[{"name":"strength","calculationString":"@a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.strength"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]},{"name":"dexterity","calculationString":"@a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.dexterity"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]},{"name":"constitution","calculationString":"@a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.constitution"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]},{"name":"wisdom","calculationString":"@a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.wisdom"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]},{"name":"intelligence","calculationString":"@a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.intelligence"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]},{"name":"charisma","calculationString":"@a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.charisma"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]}]},{"name":"Spell DC","data":[{"name":"strength","calculationString":"8 + @a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.strength"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]},{"name":"dexterity","calculationString":"8 + @a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.dexterity"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]},{"name":"constitution","calculationString":"8 + @a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.constitution"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]},{"name":"wisdom","calculationString":"8 + @a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.wisdom"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]},{"name":"intelligence","calculationString":"8 + @a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.intelligence"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]},{"name":"charisma","calculationString":"8 + @a + @b","calcOrigins":[{"symbol":"@a","originKey":"derived.modifiers.charisma"},{"symbol":"@b","originKey":"fixed.generic.Proficiency Bonus"}]}]},{"name":"generic","data":[{"name":"armor class","calculationString":"10 + @d","calcOrigins":[{"symbol":"@d","originKey":"derived.modifiers.dexterity"}]}]}]},"author":"Grobax","version":"0.0.1","systemCodeName":"0bdd1fd9-d27d-4e27-ad23-5da11796a0bc","systemName":"Grobax Default DnD For Obsidian"}`;
	const sys = JSONHandler.deserialize(TTRPGSystemJSONFormatting,JSON)
	return sys;
}


test(' test a correct calculation ', () => {
	
	var controller = new DerivedItemController2();
	
	// Create the system wich we test with. this is a DnD 5e System. 
	const sys = startTest();

	// we prepare a test with a correct recaulculation
	var calculation = "( @a + @b )/2 + 2";
	var mappedOrigins : originRowDataMin[] = [
		{key:'@a',segments:['derived','modifiers','strength']},
		{key:'@b',segments:['derived','modifiers','dexterity']}
	]
	var outHolder = {}
	var out = (k,v,db) => {
		outHolder[k] = {key:k, value:v, debug:db};
	}

	//recalculate
	var result = controller.ValidateCalculation( null , out, calculation , mappedOrigins );
	
		// go Through Result
		expect(result.succes).toEqual(true);
		expect(result.value).toEqual(3);
		
		let origMap = {}
		result.origins.forEach( r => origMap[r.key] = r );
		var get = (targ:string) => {
			var curr = origMap[targ] as originRowData;
			return curr;
		}
		var symb = "";

		// @a 
		symb = '@a';
		expect( get(symb).active 	).toEqual(true);
		expect( get(symb).inCalc 	).toEqual(true);
		expect( get(symb).isSelectAllTarget ).toEqual(false);
		expect( get(symb).segments 	).toEqual( mappedOrigins.find( p => p.key == symb)?.segments );
		expect( get(symb).testValue	).toEqual(1);
		expect( get(symb).target 	).toEqual(null);

		// @b 
		symb = '@b';
		expect( get(symb).active 	).toEqual(true);
		expect( get(symb).inCalc 	).toEqual(true);
		expect( get(symb).isSelectAllTarget ).toEqual(false);
		expect( get(symb).segments 	).toEqual( mappedOrigins.find( p => p.key == symb)?.segments );
		expect( get(symb).testValue	).toEqual(1);
		expect( get(symb).target 	).toEqual(null);

	// --- ---- ---- --- now add target To The Origins
	sys.getNode('fixed','stats','strength'	)?.setValue(14); // results in modifier +2;
	sys.getNode('fixed','stats','dexterity'	)?.setValue(14); // results in modifier +2;
	mappedOrigins  = [
		{key:'@a',segments:['derived','modifiers','strength'] , target: sys.getNode('derived','modifiers','strength')	as GrobNodeType },
		{key:'@b',segments:['derived','modifiers','dexterity'], target: sys.getNode('derived','modifiers','dexterity')	as GrobNodeType }
	]
	//recalculate
	result = controller.ValidateCalculation( null , out, calculation , mappedOrigins );

		// go Through Result
		expect(result.succes).toEqual(true);
		expect(result.value).toEqual(4);
		
		origMap = {}
		result.origins.forEach( r => origMap[r.key] = r );
		var get = (targ:string) => {
			var curr = origMap[targ] as originRowData;
			return curr;
		}
		symb = "";

		// @a 
		symb = '@a';
		expect( get(symb).active 	).toEqual(true);
		expect( get(symb).inCalc 	).toEqual(true);
		expect( get(symb).isSelectAllTarget ).toEqual(false);
		expect( get(symb).segments 	).toEqual( mappedOrigins.find( p => p.key == symb)?.segments );
		expect( get(symb).testValue	).toEqual(2);
		expect( get(symb).target 	).toBeTruthy();

		// @b 
		symb = '@b';
		expect( get(symb).active 	).toEqual(true);
		expect( get(symb).inCalc 	).toEqual(true);
		expect( get(symb).isSelectAllTarget ).toEqual(false);
		expect( get(symb).segments 	).toEqual( mappedOrigins.find( p => p.key == symb)?.segments );
		expect( get(symb).testValue	).toEqual(2);
		expect( get(symb).target 	).toBeTruthy();

		mappedOrigins  = [
			{key:'@a',segments:['derived','modifiers','strength'] , testValue : 5 },
			{key:'@b',segments:['derived','modifiers','dexterity'], testValue : 5 }
		]
		//recalculate
		result = controller.ValidateCalculation( null , out, calculation , mappedOrigins );
	
			// go Through Result
			expect(result.succes).toEqual(true);
			expect(result.value).toEqual(7);


})
test(' Missing Symbols - calculation ', () => {
	
	var controller = new DerivedItemController2();
	
	// Create the system wich we test with. this is a DnD 5e System. 
	const sys = startTest();

	// we prepare a test with a correct recaulculation
	var calculation = "( @a + @b )/2 + 2";
	var mappedOrigins : originRowDataMin[] = [
		{key:'@a',segments:['derived','modifiers','strength']}
	]
	var outHolder = {}
	var out = (k,v,db) => {
		outHolder[k] = {key:k, value:v, debug:db};
	}

	//recalculate
	var result = controller.ValidateCalculation( null , out, calculation , mappedOrigins );

	// go Through Result
	expect(result.succes).toEqual(false);
	expect(result.value).toEqual(NaN);
	
	// exspec there to be more outputs, 
	expect(result.origins.length).toEqual(2); 
	var unIncluded = result.origins.find(p => p.key == '@b');
	expect(unIncluded).toBeTruthy();
	expect(unIncluded?.active).toEqual(false);
	expect(unIncluded?.inCalc).toEqual(true);

	// ensure that the right error message are added
	expect(outHolder['@b']).toBeTruthy();
	expect(outHolder['@b'].debug).toEqual('missing')
})
test(' Missing Unused Symbols - calculation ', () => {
	
	var controller = new DerivedItemController2();
	
	// Create the system wich we test with. this is a DnD 5e System. 
	const sys = startTest();

	// we prepare a test with a correct recaulculation
	var calculation = "( @a + @b )";
	var mappedOrigins : originRowDataMin[] = [
		{key:'@a',segments:['derived','modifiers','strength']},
		{key:'@b',segments:['derived','modifiers','wisdom']},
		{key:'@w',segments:['derived','modifiers','intelligence']},
	]
	var outHolder = {}
	var out = (k,v,db) => {
		outHolder[k] = {key:k, value:v, debug:db};
	}

	//recalculate
	var result = controller.ValidateCalculation( null , out, calculation , mappedOrigins );
	
	// go Through Result
	expect(result.succes).toEqual(false);
	expect(result.value).toEqual(NaN);
	
	// exspec there to be more outputs, 
	expect(result.origins.length).toEqual(3); 
	var d = result.origins.find(p => p.key == '@w');
	expect(d).toBeTruthy();
	expect(d?.active).toEqual(false);
	expect(d?.inCalc).toEqual(false);
	
	// ensure that the right error message are added
	expect(outHolder['@w']).toBeTruthy();
	expect(outHolder['@w'].debug).toEqual('unused')

})


function checkItWorksWithout_optionals( outHolder,out, calculation, mappedOrigins, controller, skipMappedCheck = false ){

	//recalculate
	var result = controller.ValidateCalculation( null , out, calculation , mappedOrigins );

	// go Through Result
	expect(result.succes).toEqual(true);
	expect(result.value).toEqual(3);
	
	let origMap = {}
	result.origins.forEach( r => origMap[r.key] = r );
	var get = (targ:string) => {
		var curr = origMap[targ] as originRowData;
		return curr;
	}
	var symb = "";

	if (!skipMappedCheck) {
		// @a 
		symb = '@a';
		expect( get(symb).active 	).toEqual(true);
		expect( get(symb).inCalc 	).toEqual(true);
		expect( get(symb).isSelectAllTarget ).toEqual(false);
		expect( get(symb).segments 	).toEqual( mappedOrigins.find( p => p.key == symb)?.segments );
		expect( get(symb).testValue	).toEqual(1);
		expect( get(symb).target 	).toEqual(null);

		// @b 
		symb = '@b';
		expect( get(symb).active 	).toEqual(true);
		expect( get(symb).inCalc 	).toEqual(true);
		expect( get(symb).isSelectAllTarget ).toEqual(false);
		expect( get(symb).segments 	).toEqual( mappedOrigins.find( p => p.key == symb)?.segments );
		expect( get(symb).testValue	).toEqual(1);
		expect( get(symb).target 	).toEqual(null);
	}

	// no errors 
	expect( outHolder ).toEqual( {} )
}

// Test optionals
test(' Calculation correct - but missing Nodes  ', () => {
	
	var controller = new DerivedItemController2();
	
	// Create the system wich we test with. this is a DnD 5e System. 
	const sys = startTest();

	// we prepare a test with a correct recaulculation
	var calculation = "( @a + @b )/2 + 2";
	var mappedOrigins : originRowDataMin[] = [
		{key:'@a',segments:['derived','modifiers','strengthyness']},
		{key:'@b',segments:['derived','modifiers','dexterityce']}
	]
	type outM = {key:string, value:string, debug:string};
	var outHolder : Record<string,outM> = {}
	var out = (k,v,db) => {
		outHolder[k] = {key:k, value:v, debug:db} as outM;
	}

	// check it works without optionals
	checkItWorksWithout_optionals(outHolder, out, calculation, mappedOrigins, controller);

	//recalculate
	var result = controller.ValidateCalculation( sys , out, calculation , mappedOrigins );

	// go Through Result
	expect(result.succes).toEqual(false);
	expect(result.value).toEqual(NaN);
	
	expect( outHolder['@a'].debug ).toEqual( 'NoLink' );
	expect( outHolder['@b'].debug ).toEqual( 'NoLink' );

})
test(' Calculation correct - but collection location does not exist  ', () => {
	var controller = new DerivedItemController2();
	
	// Create the system wich we test with. this is a DnD 5e System. 
	const sys = startTest();

	// we prepare a test with a correct recaulculation
	var calculation = "( @a + @b )/2 + 2";
	var mappedOrigins : originRowDataMin[] = [
		{key:'@a',segments:['derived','modifiers','strength']},
		{key:'@b',segments:['derived','modifiers','dexterity']}
	]
	type outM = {key:string, value:string, debug:string};
	var outHolder : Record<string,outM> = {}
	var out = (k,v,db) => {
		outHolder[k] = {key:k, value:v, debug:db} as outM;
	}

	// check it works without optionals
	checkItWorksWithout_optionals(outHolder, out, calculation, mappedOrigins, controller);

	//recalculate
	var result = controller.ValidateCalculation( sys , out, calculation , mappedOrigins , undefined ,'Dasdsada');

	// go Through Result
	expect(result.succes).toEqual(false);
	expect(result.value).toEqual(NaN);
	
	expect( outHolder['location'].debug ).toEqual( 'NoLink' ); 


})
test(' Calculation correct - but name is already used  ', () => {

	var controller = new DerivedItemController2();
	
	// Create the system wich we test with. this is a DnD 5e System. 
	const sys = startTest();

	// we prepare a test with a correct recaulculation
	var calculation = "( @a + @b )/2 + 2";
	var mappedOrigins : originRowDataMin[] = [
		{key:'@a',segments:['derived','modifiers','strength']},
		{key:'@b',segments:['derived','modifiers','dexterity']}
	]
	type outM = {key:string, value:string, debug:string};
	var outHolder : Record<string,outM> = {}
	var out = (k,v,db) => {
		outHolder[k] = {key:k, value:v, debug:db} as outM;
	}

	// check it works without optionals
	checkItWorksWithout_optionals(outHolder, out, calculation, mappedOrigins, controller);

	//recalculate
	var result = controller.ValidateCalculation( sys , out, calculation , mappedOrigins , 'strength' ,'derived.modifiers');
	
	// go Through Result
	expect(result.succes).toEqual(false);
	expect(result.value).toEqual(NaN);
	expect( outHolder['name'].debug ).toEqual( 'taken' ); 

})
test(' Calculation correct - but name is empty ', () => {

	var controller = new DerivedItemController2();
	
	// Create the system wich we test with. this is a DnD 5e System. 
	const sys = startTest();

	// we prepare a test with a correct recaulculation
	var calculation = "( @a + @b )/2 + 2";
	var mappedOrigins : originRowDataMin[] = [
		{key:'@a',segments:['derived','modifiers','strength']},
		{key:'@b',segments:['derived','modifiers','dexterity']}
	]
	type outM = {key:string, value:string, debug:string};
	var outHolder : Record<string,outM> = {}
	var out = (k,v,db) => {
		outHolder[k] = {key:k, value:v, debug:db} as outM;
	}

	// check it works without optionals
	checkItWorksWithout_optionals(outHolder, out, calculation, mappedOrigins, controller);

	//recalculate
	var result = controller.ValidateCalculation( sys , out, calculation , mappedOrigins , '' ,'derived.modifiers');
	
	// go Through Result
	expect(result.succes).toEqual(false);
	expect(result.value).toEqual(NaN);
	expect( outHolder['name'].debug ).toEqual( 'empty' ); 

})
test(' Calculation correct - but name contains illigal characters ', () => {

	var controller = new DerivedItemController2();
	
	// Create the system wich we test with. this is a DnD 5e System. 
	const sys = startTest();

	// we prepare a test with a correct recaulculation
	var calculation = "( @a + @b )/2 + 2";
	var mappedOrigins : originRowDataMin[] = [
		{key:'@a',segments:['derived','modifiers','strength']},
		{key:'@b',segments:['derived','modifiers','dexterity']}
	]
	type outM = {key:string, value:string, debug:string};
	var outHolder : Record<string,outM> = {}
	var out = (k,v,db) => {
		outHolder[k] = {key:k, value:v, debug:db} as outM;
	}

	// check it works without optionals
	checkItWorksWithout_optionals(outHolder, out, calculation, mappedOrigins, controller);

	//recalculate
	var result = controller.ValidateCalculation( sys , out, calculation , mappedOrigins , 'name.asdads.nasdad.' ,'derived.modifiers');
	
	// go Through Result
	expect(result.succes).toEqual(false);
	expect(result.value).toEqual(NaN);
	expect( outHolder['name'].debug ).toEqual( 'illigal' ); 

})
test(' Calculation invalid ', () => {
	
	var controller = new DerivedItemController2();
	
	// Create the system wich we test with. this is a DnD 5e System. 
	const sys = startTest();

	// we prepare a test with a correct recaulculation
	var calculation = "1 + 2";
	var mappedOrigins : originRowDataMin[] = [
	
	]
	type outM = {key:string, value:string, debug:string};
	var outHolder : Record<string,outM> = {}
	var out = (k,v,db) => {
		outHolder[k] = {key:k, value:v, debug:db} as outM;
	}

	// check with a correct calc it works 
	checkItWorksWithout_optionals( outHolder, out, calculation, mappedOrigins, controller , true )
	
	// invalidate calc
	calculation = "1 + 2 / B ";
	var res = controller.ValidateCalculation( null , out, calculation, mappedOrigins );

	expect(res.succes).toEqual(false)
	expect(res.value).toEqual(NaN)
	expect(res.origins).toEqual([])

	expect(outHolder['calc']).toBeTruthy();
	expect(outHolder['calc'].debug).toEqual('invalid');

})
test(' all errors , ', () => {
	
	var controller = new DerivedItemController2();
	
	// Create the system wich we test with. this is a DnD 5e System. 
	const sys = startTest();

	// we prepare a test with a correct recaulculation
	var calculation = "( @a + @b )";
	var mappedOrigins : originRowDataMin[] = [
		{key:'@a',segments:['derived','modifiers','strengthy']}, 
		{key:'@w',segments:['derived','modifiers','intelligence']},
	]
	type outM = {key:string, value:string, debug:string};
	var outHolder : Record<string,outM> = {}
	var out = (k,v,db) => {
		outHolder[k] = {key:k, value:v, debug:db} as outM;
	}

	//recalculate
	var result = controller.ValidateCalculation( sys , out, calculation , mappedOrigins , undefined, 'derived.modificationales');


	// ensure that the unused error message are added
	expect(outHolder['@w']).toBeTruthy();
	expect(outHolder['@w'].debug).toEqual('unused')

	// ensure that the deleted error message are added
	expect(outHolder['@b']).toBeTruthy();
	expect(outHolder['@b'].debug).toEqual('missing')

	// non Target Node
	expect( outHolder['@a'].debug ).toEqual( 'NoLink' );

	// Non Existing location
	expect( outHolder['location'].debug ).toEqual( 'NoLink' );


})