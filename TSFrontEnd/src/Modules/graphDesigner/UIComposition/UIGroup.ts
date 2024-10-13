
import { StringFunctions } from "../../../../src/Modules/core/BaseFunctions/stringfunctions";
import { IViewElementUpdateable, updateEvents, UpdateListener } from "./Various";
import { TTRPGSystemJSONFormatting } from ".."; 
import { GrobCollection, GrobGroup, GrobNodeType } from "ttrpg-system-graph";
import { UISystem } from "./UISystem";
import { UICollection } from "./UICollection";

export class UIGroup extends UpdateListener implements IViewElementUpdateable {


	sys: UISystem;
	link: GrobGroup<GrobNodeType>;
	collections: UICollection[] = [];
	key: string;
	name: string;
	nameEdit: string;
	valid: boolean;
	parent: UISystem;

    private _isConstructed = false;

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
        this._isConstructed = true;

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

        if(!this._isConstructed){
            return;
        }
        
		this.key = this.link.getKey();
		this.name = this.link.getName();
		this.nameEdit = this.link.getName();
		var colNames = this.link.getCollectionsNames();
		
		// UIGroup Update
		for (let i = 0; i < colNames.length; i++) {
			
			// if already exists. dont make a new
			const n = colNames[i];
			if(this._hasCollection(n)){
				continue;
			}

			const col = this.link.getCollection(n); 
			if (!col)
				continue;

			const uicol = this._addCollection(this.sys, col);
		} 

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