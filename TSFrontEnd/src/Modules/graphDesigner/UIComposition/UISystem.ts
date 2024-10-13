import { StringFunctions } from "../../../../src/Modules/core/BaseFunctions/stringfunctions";
import { updateEvents, UpdateListener } from "./Various";
import { TTRPGSystemJSONFormatting } from "..";
import { UIGroup } from "./UIGroup";
import { GrobGroup, GrobNodeType } from "ttrpg-system-graph";


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