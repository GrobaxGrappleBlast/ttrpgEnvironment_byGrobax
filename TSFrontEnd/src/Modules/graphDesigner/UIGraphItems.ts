import { StringFunctions } from "../core/BaseFunctions/stringfunctions";
import { TTRPGSystemJSONFormatting } from ".";
import { GrobCollection, GrobGroup, GrobNodeType } from "ttrpg-system-graph";



export interface IViewElement {
	key: string;
	name: string;
	nameEdit: string;
	valid: boolean;
}

export interface IViewElementUpdateable extends UpdateListener {
	key: string;
	name: string;
	nameEdit: string;
	valid: boolean;
}

class UpdateListener {

	protected guid = StringFunctions.uuidv4();
	public listenersKeyed = {};
	public listenersEvents = {};

	protected callUpdateListeners(event) {
		if (!this.listenersEvents[event]) {
			return;
		}

		const keys = Object.keys(this.listenersEvents[event]);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			this.listenersEvents[event][key].call();
		}
	}
	addEventListener(key, event: string, listener: () => any) {

		if (!this.listenersEvents[event]) {
			this.listenersEvents[event] = {};
		}

		if (!this.listenersKeyed[key]) {
			this.listenersKeyed[key] = {};
		}

		this.listenersKeyed[key][event] = listener;
		this.listenersEvents[event][key] = listener;
	}

	removeEventListener(key) {

		// first get all events 
		let events = Object.keys(this.listenersKeyed[key] ?? {});
		for (let i = 0; i < events.length; i++) {
			const e = events[i];

			//delete this key from all events 
			delete this.listenersEvents[e][key];
		}

		// delte this key 
		delete this.listenersKeyed[key];
	}
	removeAllEventListeners() {
		this.listenersKeyed = {};
		this.listenersEvents = {};
	}
}
enum updateEvents {
	validChange = 'ValidUpdated',
	update = 'update',

}




export class UISystem extends UpdateListener {

	sys: TTRPGSystemJSONFormatting;
	groups: UIGroup[] = [];
	valid: boolean = true;

	constructor(system: TTRPGSystemJSONFormatting) {
		super();
		this.sys = system;
		this.valid = true;
		let groups = ['derived', 'fixed'];
		for (let i = 0; i < groups.length; i++) {
			const grp = this.sys.data[groups[i]] as GrobGroup<GrobNodeType>;;
			const uigrp = new UIGroup(this, grp);

			this.groups.push(uigrp);
			this.valid = this.valid && uigrp.valid;
			uigrp.addEventListener(this.guid, updateEvents.validChange, this.update.bind(this));
			uigrp.parent = this;
		}
	}
	update() {

		let orig = this.valid;

		var isValid = true;
		this.groups.forEach(p => {
			isValid = isValid && p.valid;
		})
		this.valid = isValid;

		if (orig != this.valid) {
			this.callUpdateListeners(updateEvents.validChange);
		}
		this.callUpdateListeners(updateEvents.update);
	}


	public getGroup(name: string) {
		return this.groups.find(p => p.name == name);
	}
	public hasGroup(name: string) {
		return !!this.getGroup(name)
	}

	public getCollection(group: string, col: string) {
		return this.getGroup(group)?._getCollection(col);
	}
	public hasCollection(group: string, col: string) {
		return !!this.getCollection(group, col);
	}
	public addCollection(group: string, col?: string) {

		if (!col) {
			const names = this.sys.getCollectionNames(group);
			col = StringFunctions.recursiveFindNewName('new Collection', names, (e) => e)
		}

		const gCol = this.sys.createCollection(group, col) as any;
		const uCol = this.getGroup(group)?._addCollection(this, gCol);
	}
	public remCollection(group: string, col: string) {
		
		this.getGroup(group)?._remCollection(col);
	}
	public renameCollection(group: string, col: string, rename: string) {
		this.sys.renameCollection(group, col, rename);
	}

	public getNode(group: string, col: string, name: string) {
		return this.getGroup(group)?._getCollection(col)?._getNode(name);
	}
	public hasNode(group: string, col: string, name: string) {
		return !!this.getNode(group, col, name);
	}
	public addNode(group: string, col: string, name?: string) {

		if (!name) {
			const names = this.sys.getNodeNames(group, col) ?? [];
			name = StringFunctions.recursiveFindNewName('new node', names, (e) => e);
		}

		this.sys.createNode(group, col, name);
		const node = this.sys.getNode(group, col, name);
		if (!node) {
			console.error('could not add new node');
			return;
		}
		this.getGroup(group)?._getCollection(col)?._addNode(node, this);
	}
	public remNode(group: string, col: string, name: string) {
		
		this.sys.deleteNode(group, col, name);
		this.getGroup(group)?._getCollection(col)?._remNode(name);
	}
	public renameNode(group: string, col: string, name: string, rename) {
		this.sys.renameItem(group, col, name, rename);
	}

}
export class UIGroup extends UpdateListener implements IViewElementUpdateable {


	sys: UISystem;
	link: GrobGroup<GrobNodeType>;
	collections: UICollection[] = [];
	key: string;
	name: string;
	nameEdit: string;
	valid: boolean;
	parent: UISystem;

	constructor(system: UISystem, group: GrobGroup<GrobNodeType>) {
		super();
		this.sys = system;
		this.link = group;

		this.key = group.getKey();
		this.name = group.getName();
		this.nameEdit = this.name;

		var isValid = true;
		var colNames = group.getCollectionsNames();
		for (let i = 0; i < colNames.length; i++) {
			const n = colNames[i];
			const col = group.getCollection(n);

			if (!col)
				continue;

			const uicol = this._addCollection(this.sys, col);
			isValid = isValid && uicol.valid;
		}
		this.link.addUpdateListener(this.key, this.update.bind(this));
		this.valid = isValid;

	}

	isValidUpdate() {

		let orig = this.valid;

		var isValid = true;
		this.collections.forEach(p => {
			isValid = isValid && p.valid;
		})
		this.valid = isValid;

		if (orig != this.valid) {
			this.callUpdateListeners(updateEvents.validChange);
		}
	}

	update() {

		this.key = this.link.getKey();
		this.name = this.link.getName();
		this.nameEdit = this.link.getName();
		this.isValidUpdate();
		this.callUpdateListeners(updateEvents.update);
	}

	dispose() {

		this.removeAllEventListeners();
		this.collections.forEach(n => n.dispose());

		//@ts-ignore
		this.link = null;
		//@ts-ignore
		this.sys = null;

		this.collections = [];
		//@ts-ignore
		this.parent = null;
	}

	public getCollection(group: string, col: string) {
		this.parent.getCollection(group, col);
	}
	public hasCollection(group: string, col: string) {
		this.parent.hasCollection(group, col);
	}
	public addCollection(group: string, col: string) {
		this.parent.addCollection(group, col);
	}
	public remCollection(group: string, col: string) { 
		this.parent.remCollection(group, col);
	}

	public _getCollection(col: string) {
		return this.collections.find(p => p.name == col);
	}
	public _hasCollection(col: string) {
		return !!(this.collections.find(p => p.name == col));
	}
	public _addCollection(system: UISystem, col: GrobCollection<GrobNodeType>) {
		let uCol = new UICollection(system, col);
		this.collections.push(uCol);
		uCol.addEventListener(this.key, updateEvents.validChange, this.isValidUpdate.bind(this));
		uCol.parent = this;
		return uCol;
	}
	public _remCollection(col: string) {
		let uCol = this.collections.find(p => p.name == col);
		this.collections = this.collections.filter(p => p.name != col);
		uCol?.removeEventListener(this.key);
		uCol?.dispose();
		this.update();
	}


}
export class UICollection extends UpdateListener implements IViewElementUpdateable {

	sys: UISystem;
	link: GrobCollection<GrobNodeType>; derivedCol
	nodes: UINode[] = [];
	key: string;
	name: string;
	nameEdit: string;
	valid: boolean;
	parent: UIGroup;

	constructor(system: UISystem, col: GrobCollection<GrobNodeType>) {
		super();
		this.sys = system;
		this.link = col;

		this.key = col.getKey();
		this.name = col.getName();
		this.nameEdit = this.name;

		var isValid = true;
		var nodeNames = col.getNodeNames();
		for (let i = 0; i < nodeNames.length; i++) {
			const n = nodeNames[i];
			const node = col.getNode(n);

			if (!node)
				continue;

			const uinode = this._addNode(node, this.sys);
			isValid = isValid && uinode.valid;
		}

		this.link.addUpdateListener(this.key, this.update.bind(this));
		this.valid = isValid;
	}

	isValidUpdate() {
		var orig = this.valid;

		var isValid = true;
		this.nodes.forEach(p => {
			isValid = isValid && p.valid;
		})
		this.valid = isValid;

		if (orig != this.valid) {
			this.callUpdateListeners(updateEvents.validChange);
		}
	}

	update() {

		this.key 		= this.link.getKey();
		this.name 		= this.link.getName();
		this.nameEdit 	= this.link.getName();
		this.isValidUpdate();
		this.callUpdateListeners(updateEvents.update);
	}

	dispose() {

		// get rid of node listener
		this.link.removeUpdateListener(this.key);
		this.removeAllEventListeners();

		// dispose of all children. 
		this.nodes.forEach(n => n.dispose());

		//@ts-ignore
		this.link = null;
		//@ts-ignore
		this.sys = null;

		this.nodes = [];
		//@ts-ignore
		this.parent = null;
	}

	public getNode(name: string) {
		return this.parent.parent.getNode(this.parent.name, this.name, name)
	}

	public hasNode(name: string) {
		return this.parent.parent.hasNode(this.parent.name, this.name, name)
	}

	public addNode(name: string) {
		return this.parent.parent.addNode(this.parent.name, this.name, name)
	}

	public remNode(name: string) {
		return this.parent.parent.remNode(this.parent.name, this.name, name);
	}

	public renameNode(name: string, rename: string) {
		return this.parent.parent.renameNode(this.parent.name, this.name, name, rename)
	}



	public _getNode(name: string) {
		return this.nodes.find(p => p.name == name);
	}

	public _hasNode(name: string) {
		return !!(this.nodes.find(p => p.name == name))
	}

	public _addNode(link: GrobNodeType, system: UISystem) {  
		let uNode = new UINode(system, link);
		this.nodes.push(uNode);
		uNode.addEventListener(this.key, updateEvents.validChange, this.isValidUpdate.bind(this));
		uNode.parent = this;
		this.update();
		return uNode;
	}

	public _remNode(name: string) {
		let uNode = this.nodes.find(p => p.name == name);
		this.nodes = this.nodes.filter(p => p.name != name);
		uNode?.removeEventListener(this.key);
		uNode?.dispose();
		this.update();
	}


}
export class UINode extends UpdateListener implements IViewElementUpdateable {

	sys: UISystem;
	link: GrobNodeType;
	key: string;
	name: string;
	nameEdit: string;
	valid: boolean;
	parent: UICollection

	constructor(system: UISystem, node: GrobNodeType) {
		super();
		this.link = node;
		this.sys = system;

		this.key = node.getKey();
		this.name = node.getName();
		this.nameEdit = node.getName();
		this.valid = node.isValid();

		this.link.addUpdateListener(this.key, this.update.bind(this));
	}

	update() {

		let validOrig = this.valid;

		this.key = this.link.getKey();
		this.name = this.link.getName();
		this.nameEdit = this.link.getName();
		this.valid = this.link.isValid();

		if (validOrig != this.valid) {
			this.callUpdateListeners(updateEvents.validChange);
		}
		this.callUpdateListeners(updateEvents.update);
	}

	dispose() {

		this.removeAllEventListeners();
		this.link.removeUpdateListener(this.key);
		//@ts-ignore
		this.link = null;
		//@ts-ignore
		this.sys = null;
		//@ts-ignore
		this.parent = null;
	}

}