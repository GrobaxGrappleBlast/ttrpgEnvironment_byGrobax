import exp from 'constants';
import { JSONHandler } from '../../../JSONModules';
import 
{
	GrobDerivedOrigin,
	TTRPGSystem,
} from '../../index'

import {type GrobNodeType } from '../../index';

function setUpTests(){
	let sys = new TTRPGSystem();
	sys.initAsNew();
	
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

	'proficiency bonus';
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
test('First Test', () => {

	let sys = setUpTests();

	let cold = sys.createDerivedCollection('Test');
	let node = sys.createDerivedNode(cold,'TestNode');

	// ensure that the node is placed correctly;
	expect(node?.getName()).toEqual('TestNode');
	expect(node?.parent.getName()).toEqual(cold.getName());
	node?.setCalc('@a - 5');
	let survivalNode = sys.getFixedNode('proficiencies skill', 'Survival');
	node?.setOrigin('@a',survivalNode);
	

	expect( survivalNode.getDependents().length ).toBe(1);
	expect( survivalNode.getDependents()[0].getName() ).toEqual('TestNode');

	// now ensure that everything is deleted correctly when The collection is deleted
	sys.deleteDerivedCollection('Test');
	
	// bottom up
	// Nodes first. 
	expect( survivalNode.getDependents().length ).toBe(0);
	expect(sys.getDerivedNode('Test','TestNode')).toBe(null);
	expect(sys.getDerivedCollection('Test')).toBe(null);

});

test('Json expo', () => {

	let sys = setUpTests();
	
	let node = sys.getNode('derived','Spell DC','dexterity')
	let coll = sys.getCollection('derived','Spell DC');
	let grp = (sys as any)._getGroup('derived');

	let json = JSONHandler.serialize(sys);
	

});


test('Test After Deserialization, that everything is ok!', () => {

	let sys = setUpTests();
	let json = JSONHandler.serialize(sys);
	let des = JSONHandler.deserialize(TTRPGSystem,json);

	for (const group_key in (des as any).data ) {
		const group = (des as any).data[group_key];

		// tests for group
		expect(group.parent).toBe(des);

		for(const col_key in (group as any).collections_names ){
			const collection = group.collections_names[col_key];

			// tests for collection
			expect(collection.parent).toBe(group);

			for( const node_key in (collection as any).nodes_names ){
				const node = (collection as any).nodes_names[node_key];
				
				// tests for nodes
				// derived nodes
				expect(node.parent).toBe(collection);

				const origins : GrobDerivedOrigin[] = node.origins ?? [];
				origins.forEach( origin  => {
					try {
						// Expect originkey and targets locationkey to match
						expect(origin.originKey).toEqual(origin.origin?.getLocationKey())

						// ensure that the key can be looked up correctly. and target the right guy
						const origpieces = origin.originKey.split('.'); 
						expect(origin.origin).toEqual(des.getNode(origpieces[0] as any ,origpieces[1],origpieces[2]))

						// ensure all origins are precent in the dependencies list.
						const deplist			= Object.values((node as GrobNodeType).dependencies);
						const findoriginInDep	= deplist.findIndex(p => p.getKey() == origin.origin?.getKey()) ;
						expect(findoriginInDep != -1 ).toBe(true)

						// ensure that this node exists as a dependent on the target node
						const deptsList = Object.values((origin.origin  as GrobNodeType).dependents);
						const findOriginInDepts = deptsList.findIndex( p => p.getKey() == node.getKey() );
						expect(findOriginInDepts != -1 ).toBe(true)

					} catch (e) {
						e.message = e.message + 
							`for ${group_key}.${col_key}.${node_key}` + "\n" +
							`something was wrong with origin` + "\n" +
							`${JSONHandler.serialize(origin)};`
						throw e;
					}
				}); 
			}

		}
		
	} 

	expect(true).toBe(true);

});