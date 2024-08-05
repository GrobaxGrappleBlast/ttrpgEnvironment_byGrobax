


import { JSONHandler } from '../../../../../JSONModules/index';//"../../JSONModules/index"; 
import { TTRPGSystem } from '../../../../../../Modules/Designer/index'
import { DerivedCollectionController} from '../DerivedCollectionDesignerController';  
const selAllInCollectionString = '- - Select all - -';

const loadedSystemJSON = `{"fixed": {"name": "fixed","collections_names": [{"name": "stats","data": [{"name": "strength","standardValue": 1},{"name": "dexterity","standardValue": 1},{"name": "constitution","standardValue": 1},{"name": "wisdom","standardValue": 1},{"name": "intelligense","standardValue": 1},{"name": "charisma","standardValue": 1}]},{"name": "SkillProficiencies","data": [{"name": "Athletics","standardValue": 0},{"name": "Acrobatics","standardValue": 0},{"name": "Sleight of Hand","standardValue": 0},{"name": "Arcana","standardValue": 0},{"name": "History","standardValue": 0},{"name": "Investigation","standardValue": 0},{"name": "Nature","standardValue": 0},{"name": "Religion","standardValue": 0},{"name": "Animal Handling","standardValue": 0},{"name": "Insight","standardValue": 0},{"name": "Medicine","standardValue": 0},{"name": "Perception","standardValue": 0},{"name": "Survival","standardValue": 0},{"name": "Deception","standardValue": 0},{"name": "Intimidation","standardValue": 0},{"name": "Performance","standardValue": 0},{"name": "Persuasion","standardValue": 0}]},{"name": "generic","data": [{"name": "Proficiency Bonus","standardValue": 1},{"name": "Hit Points","standardValue": 1}]}]},"author": "","version": "","systemCodeName": "","systemName": ""}`;



test('Test Collection Designer Derived Elements', () => {

	var a = 12
 
	// create the start requirements
	let system = JSONHandler.deserialize( TTRPGSystem , loadedSystemJSON );
	let origins = JSON.parse('[{"key":"@a","segments":["fixed","stats","- - Select all - -"],"active":true,"testValue":1,"inCalc":true,"target":null,"isSelectAllTarget":true}]')
 
	// creating the Creation view settings
	let controller = new DerivedCollectionController();
	controller.setControllerDeps( system ); 
	controller.recalculateCalcAndOrigins()
	controller.checkIsValid(); 
	controller.mappedOrigins			.set(origins); 
	controller.name						.set('testCollection');
	controller.nameCalc					.set('@a');
	controller.calc						.set('@a'); 

	// save it 
	controller.saveCollection();

	// SERIALIZE 
	let json = JSONHandler.serialize(system);
	let system2 = JSONHandler.deserialize( TTRPGSystem , json );

	var a = 12 + 1;


	// quick exspect lengths to be the same
	expect(Object.keys(system2.derived.collections_names).length)			.toEqual( Object.keys(system.derived.collections_names).length); 
	
	// slower exspect names to be the same, and order to be the same. 
	expect(JSON.stringify(Object.keys(system2.derived.collections_names)))	.toEqual(JSON.stringify(Object.keys(system.derived.collections_names)))

	// Coverage Gutters 
	// Jest - ligner en clovne sko
	 
})