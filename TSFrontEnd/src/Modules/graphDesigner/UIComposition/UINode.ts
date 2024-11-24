import { StringFunctions } from "../../../../src/Modules/core/BaseFunctions/stringfunctions";
import { IViewElementUpdateable, updateEvents, UpdateListener } from "./Various";
import { TTRPGSystemJSONFormatting } from "..";
import { UIGroup } from "./UIGroup";
import { GrobGroup, GrobNodeType } from "ttrpg-system-graph";
import { UISystem } from "./UISystem";
import { UICollection } from "./UICollection";

export class UINode extends UpdateListener implements IViewElementUpdateable {

	sys: UISystem;
	link: GrobNodeType;
	key: string;
	name: string;
	nameEdit: string;
	valid: boolean;
	parent: UICollection

    private _isConstructed = false;
    

	constructor(system: UISystem, node: GrobNodeType | any) {
		super();

		var names = Object.keys( node.updateListeners );
		if (names.includes( node.getKey()) ){
			throw new Error('was was already created');
		}
		
		this.link = node;
		this.sys = system;

		this.key = node.getKey();
		this.name = node.getName();
		this.nameEdit = node.getName();
		this.valid = node.isValid();
		
		this.link.addUpdateListener(this.key, this.update.bind(this));
        this._isConstructed = true;
	}

	update() {
        if(!this._isConstructed){
            return;
        }
        
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