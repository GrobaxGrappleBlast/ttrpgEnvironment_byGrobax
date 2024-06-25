
class TNode {
	baseValue: number = 0;
	value: number | null = null;
	dependencies: Record<string, TNode> = {};
	dependents: TNode[];
	calc: string;

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

		for (let i = 0; i < this.dependents.length; i++) {
			const dep = this.dependents[i];
			dep.update();
		}
	}
}

interface ITTPRGSystem{
	fixed : {
		NewCollection0: {
			B: TNode, Aad: TNode
		}, NewCollection1: {
			NewItem0:  TNode 
		}
	}
	derived : {
		stats: {
			I1:  TNode , I2:  TNode , I3:  TNode , I4:  TNode , I5:  TNode 
		}, C: {
		}, A: {
		}, BB: {
		}, IOL: {
		}
	}
}

class TTRPGSystem implements ITTPRGSystem{
	public constructor() { this.init() }

	fixed = {
		NewCollection0: {
			B: new TNode(1, ''), Aad: new TNode(0, '')
		}, NewCollection1: {
			NewItem0: new TNode(1, '')
		}
	}
	derived = {
		stats: {
			I1: new TNode(NaN, '@a '), I2: new TNode(NaN, '@a '), I3: new TNode(NaN, '@a '), I4: new TNode(NaN, '@v'), I5: new TNode(NaN, '@a ')
		}, C: {
		}, A: {
		}, BB: {
		}, IOL: {
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
		parent.addDependency(dep, symbol);
	}
	private init() {

		this.declareDependency('derived', 'stats', 'I1', '@a', 'fixed', 'NewCollection1', 'NewItem0')
		this.declareDependency('derived', 'stats', 'I2', '@a', 'derived', 'stats', 'I1')
		this.declareDependency('derived', 'stats', 'I3', '@a', 'fixed', 'NewCollection1', 'NewItem0')
		this.declareDependency('derived', 'stats', 'I4', '@v', 'derived', 'stats', 'I4')
		this.declareDependency('derived', 'stats', 'I5', '@a', 'fixed', 'NewCollection0', 'B')
	}
} 

