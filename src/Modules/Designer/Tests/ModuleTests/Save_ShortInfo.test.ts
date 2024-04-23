
import { JSONHandler } from '../../../JSONModules';
import {
	GrobCollection,
	GrobDerivedNode,
	TTRPGSystem,
} from '../../index'

function setUpTests(){
	let sys = new TTRPGSystem();
	
	// Create Basic Stats 
	let colF = sys.createFixedCollection('stats');
	sys.createFixedNode('stats','strength');
	sys.createFixedNode('stats','dexterity');
	sys.createFixedNode('stats','constitution');
	sys.createFixedNode('stats','wisdom');
	sys.createFixedNode('stats','charisma');
	sys.createFixedNode('stats','intelligense');

	// Create Basic Infomation
	colF = sys.createFixedCollection('generel');
	sys.createFixedNode(colF,'Armor Class');
	sys.createFixedNode(colF,'Hit Points');
	sys.createFixedNode(colF,'Hit Dice');
	sys.createFixedNode(colF,'proficiency bonus');
	
	// create character info data
	colF = sys.createFixedCollection('charinfo');
	sys.createFixedNode(colF,'name');
	sys.createFixedNode(colF,'class');
	sys.createFixedNode(colF,'background');
	sys.createFixedNode(colF,'backgroundfeature');
	sys.createFixedNode(colF,'level'); 

	// Derived Data 
	function createModifier(col,stat){
		let mod = sys.createDerivedNode(col,stat);
		if(!mod){
			throw new Error('Could not create Mod')
			return;
		}

		mod.setCalc('Math.floor((@a - 10 )/ 2 )');
		let fNode = sys.getFixedNode('stats',stat);
		mod.setOrigin('@a',fNode);
	}
	let colD = sys.createDerivedCollection('modifiers');
	createModifier('modifiers','strength')
	createModifier('modifiers','dexterity');
	createModifier('modifiers','constitution');
	createModifier(colD,'wisdom');
	createModifier(colD,'charisma');
	createModifier(colD,'intelligense');
 
	function SpellBonus( col , stat){
		let bonus = sys.createDerivedNode(col,stat);
		if(!bonus){
			throw new Error('Could not create bonus')
			return;
		}

		bonus.setCalc('@a + @b');
		let profBonus =sys.getFixedNode('generel','proficiency bonus')
		let modifier  =sys.getDerivedNode('modifiers',stat)
		bonus.setOrigin('@a',profBonus	);
		bonus.setOrigin('@b',modifier	); 
	}
	colD = sys.createDerivedCollection('Spell Bonus');
	SpellBonus('Spell Bonus', 'strength');
	SpellBonus('Spell Bonus', 'dexterity');
	SpellBonus('Spell Bonus', 'constitution');
	SpellBonus(colD, 'wisdom');
	SpellBonus(colD, 'charisma');
	SpellBonus(colD, 'intelligense');


	function SpellDC( col , stat){
		let bonus = sys.createDerivedNode(col,stat);
		if(!bonus){
			throw new Error('Could not create bonus')
			return;
		}

		bonus.setCalc('8 + @a + @b');
		let profBonus =sys.getFixedNode('generel','proficiency bonus')
		let modifier  =sys.getDerivedNode('modifiers',stat)
		bonus.setOrigin('@a',profBonus	);
		bonus.setOrigin('@b',modifier	); 
	}
	colD = sys.createDerivedCollection('Spell DC');
	SpellDC('Spell DC', 'strength');
	SpellDC('Spell DC', 'dexterity');
	SpellDC('Spell DC', 'constitution');
	SpellDC(colD, 'wisdom');
	SpellDC(colD, 'charisma');
	SpellDC(colD, 'intelligense');

	// Saving Throw Proficiencies
	colF = sys.createFixedCollection('proficiencies Saving Throws');
	sys.createFixedNode(colF,'strength');
	sys.createFixedNode(colF,'dexterity');
	sys.createFixedNode(colF,'constitution');
	sys.createFixedNode(colF,'wisdom');
	sys.createFixedNode(colF,'charisma');
	sys.createFixedNode(colF,'intelligense');

	// Armor Proficiencies
	colF = sys.createFixedCollection('proficiencies Armor');
	sys.createFixedNode(colF,'Light Armor');
	sys.createFixedNode(colF,'Medium Armor');
	sys.createFixedNode(colF,'Heavy Armor'); 

	// Weapon Proficiencies
	colF = sys.createFixedCollection('proficiencies Weapons');
	sys.createFixedNode(colF,'Simple Weapons');
	sys.createFixedNode(colF,'Martial Weapons'); 

	// Skill Proficiencies
	colF = sys.createFixedCollection('proficiencies skill');
	sys.createFixedNode(colF,'Acrobatics')
	sys.createFixedNode(colF,'Animal Handling')
	sys.createFixedNode(colF,'Arcana')
	sys.createFixedNode(colF,'Athletics')
	sys.createFixedNode(colF,'Deception')
	sys.createFixedNode(colF,'Endurance')
	sys.createFixedNode(colF,'History')
	sys.createFixedNode(colF,'Insight')
	sys.createFixedNode(colF,'Intimidation')
	sys.createFixedNode(colF,'Investigation')
	sys.createFixedNode(colF,'Medicine')
	sys.createFixedNode(colF,'Nature')
	sys.createFixedNode(colF,'Perception')
	sys.createFixedNode(colF,'Performance')
	sys.createFixedNode(colF,'Persuasion')
	sys.createFixedNode(colF,'Religion')
	sys.createFixedNode(colF,'Sleight of Hand')
	sys.createFixedNode(colF,'Stealth')
	sys.createFixedNode(colF,'Streetwise')
	sys.createFixedNode(colF,'Survival')
	return sys;
	 
}

test('Test that we can serialize every part of such a system ', () => {

	let sys = setUpTests();

	// let ser = JSON.parse(JSONHandler.serialize(sys,'preview')); 
	let c = sys.getDerivedCollection('Spell DC');
	let n = sys.getDerivedNode('Spell DC', 'wisdom');
	let ser = (JSONHandler.serialize(sys));
 
});
test('Test that we get when deserializing', () => {

	let sys = setUpTests();

	// let ser = JSON.parse(JSONHandler.serialize(sys,'preview')); 
	let c = sys.getDerivedCollection('Spell DC');
	let n = sys.getDerivedNode('Spell DC', 'wisdom');
	let ser = (JSONHandler.serialize(n));
 
	
	let des : any ; 
	des = JSONHandler.deserialize(GrobDerivedNode,ser)
	//des = JSONHandler.deserialize(GrobCollection,ser)
	//des = JSONHandler.deserialize(TTRPGSystem,ser)
	debugger;
	console.log(des);

});