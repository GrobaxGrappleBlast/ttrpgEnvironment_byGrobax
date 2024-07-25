export class TNode {
	baseValue: number = 0;
	value: number | null = null;
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

		( Object.keys(this.updateListeners) ).forEach( key => {
			this.updateListeners[key]();
		})

		for (let i = 0; i < this.dependents.length; i++) {
			const dep = this.dependents[i];
			dep.update();
		}
	}

	
	addUpdateListener( key , listener : () => any ){
		this.updateListeners[key] = listener;
	}
	removeUpdateListener( key ){
		delete this.updateListeners[key];
	}
	removeAllUpdateListeners(){
		this.updateListeners = {}
	}
}
export class system {
	public constructor() { this.init() }

	fixed = {
		stats: {
			strength: new TNode(1, ''), dexterity: new TNode(1, ''), constitution: new TNode(1, ''), wisdom: new TNode(1, ''), intelligense: new TNode(1, ''), charisma: new TNode(1, '')
		}
	}
	derived = {
		modifiers: {
			strength: new TNode(-5, 'Math.floor( (@a - 10) / 2 )'), dexterity: new TNode(-5, 'Math.floor( (@a - 10) / 2 )'), constitution: new TNode(-5, 'Math.floor( (@a - 10) / 2 )'), wisdom: new TNode(-5, 'Math.floor( (@a - 10) / 2 )'), intelligense: new TNode(-5, 'Math.floor( (@a - 10) / 2 )'), charisma: new TNode(-5, 'Math.floor( (@a - 10) / 2 )')
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
		parent.addDependency(symbol,dep);
	}
	private init() {

		this.declareDependency('derived', 'modifiers', 'strength', '@a', 'fixed', 'stats', 'strength')
		this.declareDependency('derived', 'modifiers', 'dexterity', '@a', 'fixed', 'stats', 'dexterity')
		this.declareDependency('derived', 'modifiers', 'constitution', '@a', 'fixed', 'stats', 'constitution')
		this.declareDependency('derived', 'modifiers', 'wisdom', '@a', 'fixed', 'stats', 'wisdom')
		this.declareDependency('derived', 'modifiers', 'intelligense', '@a', 'fixed', 'stats', 'intelligense')
		this.declareDependency('derived', 'modifiers', 'charisma', '@a', 'fixed', 'stats', 'charisma')
	}
} 
