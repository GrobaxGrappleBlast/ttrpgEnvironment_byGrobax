export class TNode {
	baseValue: number = 0;
	value: number | null = 0;
	dependencies: Record<string, TNode> = {};
	dependents: TNode[] = [];
	calc: string;
	updateListeners = {};

	constructor(basevalue: number, calc: string | null) {
		this.baseValue = basevalue;
		this.calc = calc ?? '';
	}

	getValue() {
		return this.value ?? this.baseValue;
	}


	setValue(value: number) {
		this.value = value;
		this.update();
		return
	}

	addDependency(symbol, node) {
		this.dependencies[symbol] = node;
		node.dependents.push(this);
	}

	update() {

		if (this.calc != '') {
			let calcStr = this.calc;
			let symbols = Object.keys(this.dependencies);
			for (let i = 0; i < symbols.length; i++) {
				const s = symbols[i];
				const v = this.dependencies[s].getValue();
				//calcStr.replace(s,this.dependencies[s].getValue());
				calcStr = calcStr.replace(s, v + '');
			}
			this.value = eval(calcStr);
		}

		(Object.keys(this.updateListeners)).forEach(key => {
			this.updateListeners[key]();
		})

		for (let i = 0; i < this.dependents.length; i++) {
			const dep = this.dependents[i];
			dep.update();
		}
	}
	addUpdateListener(key, listener: () => any) {
		this.updateListeners[key] = listener;
	}
	removeUpdateListener(key) {
		delete this.updateListeners[key];
	}
	removeAllUpdateListeners() {
		this.updateListeners = {}
	}
}
export class system {
	public constructor() { this.init() }

	fixed = {
		stats: {
			'strength': new TNode(1, ''), 'dexterity': new TNode(1, ''), 'constitution': new TNode(1, ''), 'wisdom': new TNode(1, ''), 'intelligense': new TNode(1, ''), 'charisma': new TNode(1, '')
		}, SkillProficiencies: {
			'Athletics': new TNode(0, ''), 'Acrobatics': new TNode(0, ''), 'Sleight of Hand': new TNode(0, ''), 'Arcana': new TNode(0, ''), 'History': new TNode(0, ''), 'Investigation': new TNode(0, ''), 'Nature': new TNode(0, ''), 'Religion': new TNode(0, ''), 'Animal Handling': new TNode(0, ''), 'Insight': new TNode(0, ''), 'Medicine': new TNode(0, ''), 'Perception': new TNode(0, ''), 'Survival': new TNode(0, ''), 'Deception': new TNode(0, ''), 'Intimidation': new TNode(0, ''), 'Performance': new TNode(0, ''), 'Persuasion': new TNode(0, '')
		}, generic: {
			'Proficiency Bonus': new TNode(1, ''), 'Hit Points': new TNode(1, '')
		}
	}
	derived = {
		modifiers: {
			'strength': new TNode(-5, 'Math.floor((@a-10)/2)'), 'dexterity': new TNode(-5, 'Math.floor((@a-10)/2)'), 'constitution': new TNode(-5, 'Math.floor((@a-10)/2)'), 'wisdom': new TNode(-5, 'Math.floor((@a-10)/2)'), 'intelligense': new TNode(-5, 'Math.floor((@a-10)/2)'), 'charisma': new TNode(-5, 'Math.floor((@a-10)/2)')
		}, skillproficiencyBonus: {
			'Athletics': new TNode(NaN, '@a * @c + @d'), 'Acrobatics': new TNode(NaN, '@a * @c + @d'), 'Sleight of Hand': new TNode(NaN, '@a * @c + @d'), 'Arcana': new TNode(NaN, '@a * @c + @d'), 'History': new TNode(NaN, '@a * @c + @d'), 'Investigation': new TNode(NaN, '@a * @c + @d'), 'Nature': new TNode(NaN, '@a * @c + @d'), 'Religion': new TNode(NaN, '@a * @c + @d'), 'Animal Handling': new TNode(NaN, '@a * @c + @d'), 'Insight': new TNode(NaN, '@a * @c + @d'), 'Medicine': new TNode(NaN, '@a * @c + @d'), 'Perception': new TNode(NaN, '@a * @c + @d'), 'Survival': new TNode(NaN, '@a * @c + @d'), 'Deception': new TNode(NaN, '@a * @c + @d'), 'Intimidation': new TNode(NaN, '@a * @c + @d'), 'Performance': new TNode(NaN, '@a * @c + @d'), 'Persuasion': new TNode(NaN, '@a * @c + @d')
		}
	}
	public getNode(group, collection, item) {
		if (!this[group] || !this[group][collection] || !this[group][collection][item]) {
			return null;
		}
		return this[group][collection][item];
	}
	private declareDependency(Parentgroup, Parentcollection, Parentitem, symbol, Depgroup, depcollection, depitem) {
		let parent = this.getNode(Parentgroup, Parentcollection, Parentitem);
		let dep = this.getNode(Depgroup, depcollection, depitem);

		if (!dep || !parent) {
			console.error(`
		Error at declareDependency
		${Parentgroup}, ${Parentcollection}, ${Parentitem}, ${symbol}, ${Depgroup}, ${depcollection}, ${depitem}
		`
			)
			return;
		}
		parent.addDependency(symbol, dep);
	}
	private init() {

		this.declareDependency('derived', 'modifiers', 'strength', '@a', 'fixed', 'stats', 'strength')
		this.declareDependency('derived', 'modifiers', 'dexterity', '@a', 'fixed', 'stats', 'dexterity')
		this.declareDependency('derived', 'modifiers', 'constitution', '@a', 'fixed', 'stats', 'constitution')
		this.declareDependency('derived', 'modifiers', 'wisdom', '@a', 'fixed', 'stats', 'wisdom')
		this.declareDependency('derived', 'modifiers', 'intelligense', '@a', 'fixed', 'stats', 'intelligense')
		this.declareDependency('derived', 'modifiers', 'charisma', '@a', 'fixed', 'stats', 'charisma')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Athletics', '@a', 'fixed', 'SkillProficiencies', 'Athletics')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Athletics', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Athletics', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Acrobatics', '@a', 'fixed', 'SkillProficiencies', 'Acrobatics')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Acrobatics', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Acrobatics', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Sleight of Hand', '@a', 'fixed', 'SkillProficiencies', 'Sleight of Hand')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Sleight of Hand', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Sleight of Hand', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Arcana', '@a', 'fixed', 'SkillProficiencies', 'Arcana')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Arcana', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Arcana', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'History', '@a', 'fixed', 'SkillProficiencies', 'History')
		this.declareDependency('derived', 'skillproficiencyBonus', 'History', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'History', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Investigation', '@a', 'fixed', 'SkillProficiencies', 'Investigation')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Investigation', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Investigation', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Nature', '@a', 'fixed', 'SkillProficiencies', 'Nature')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Nature', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Nature', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Religion', '@a', 'fixed', 'SkillProficiencies', 'Religion')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Religion', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Religion', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Animal Handling', '@a', 'fixed', 'SkillProficiencies', 'Animal Handling')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Animal Handling', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Animal Handling', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Insight', '@a', 'fixed', 'SkillProficiencies', 'Insight')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Insight', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Insight', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Medicine', '@a', 'fixed', 'SkillProficiencies', 'Medicine')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Medicine', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Medicine', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Perception', '@a', 'fixed', 'SkillProficiencies', 'Perception')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Perception', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Perception', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Survival', '@a', 'fixed', 'SkillProficiencies', 'Survival')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Survival', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Survival', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Deception', '@a', 'fixed', 'SkillProficiencies', 'Deception')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Deception', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Deception', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Intimidation', '@a', 'fixed', 'SkillProficiencies', 'Intimidation')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Intimidation', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Intimidation', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Performance', '@a', 'fixed', 'SkillProficiencies', 'Performance')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Performance', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Performance', '@d', 'derived', 'modifiers', 'strength')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Persuasion', '@a', 'fixed', 'SkillProficiencies', 'Persuasion')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Persuasion', '@c', 'fixed', 'generic', 'Proficiency Bonus')
		this.declareDependency('derived', 'skillproficiencyBonus', 'Persuasion', '@d', 'derived', 'modifiers', 'strength')
	}
}
