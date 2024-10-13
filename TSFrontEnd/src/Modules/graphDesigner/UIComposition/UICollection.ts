

import { StringFunctions } from "../../../../src/Modules/core/BaseFunctions/stringfunctions";
import { IViewElementUpdateable, updateEvents, UpdateListener } from "./Various";
import { TTRPGSystemJSONFormatting } from ".."; 
import { GrobCollection, GrobGroup, GrobNodeType } from "ttrpg-system-graph";
import { UISystem } from "./UISystem";
import { UINode } from "./UINode";
import { UIGroup } from "./UIGroup";
import { debug } from "console";

export class UICollection extends UpdateListener implements IViewElementUpdateable {

	sys: UISystem;
	link: GrobCollection<GrobNodeType>; derivedCol
	nodes: UINode[] = [];
	key: string;
	name: string;
	nameEdit: string;
	valid: boolean;
	parent: UIGroup;

    private _isConstructed = false;

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
		this.valid = isValid;
        this._isConstructed = true;
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

        if(!this._isConstructed){
            return;
        }

		this.key 		= this.link.getKey();
		this.name 		= this.link.getName();
		this.nameEdit 	= this.link.getName();
		 
		
		const nodeNames = this.link.getNodeNames();
		for (let i = 0; i < nodeNames.length; i++) {
			
			// if already exists. dont make a new
			const n = nodeNames[i];
			if(this._hasNode(n)){
				continue;
			}
 
			const nod = this.link.getNode(n);  
			if (!nod)
				continue;

			console.log(nod.getKey());
			;
			const uinod = this._addNode(nod,this.sys);
		} 
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