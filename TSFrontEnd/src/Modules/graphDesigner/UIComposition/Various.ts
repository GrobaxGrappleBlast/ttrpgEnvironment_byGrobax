import { StringFunctions } from "../../../../src/Modules/core/BaseFunctions/stringfunctions";

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

export class UpdateListener {

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
export enum updateEvents {
	validChange = 'ValidUpdated',
	update = 'update',

}
