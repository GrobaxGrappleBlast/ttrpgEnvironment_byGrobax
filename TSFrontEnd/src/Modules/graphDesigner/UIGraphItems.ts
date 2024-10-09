import { StringFunctions } 							from "../core/BaseFunctions/stringfunctions";
import { TTRPGSystemJSONFormatting } 				from ".";
import { GrobCollection, GrobGroup, GrobNodeType } 	from "ttrpg-system-graph";



export interface IViewElement{
	key		:string;
	name	:string; 
	nameEdit:string; 
	valid	:boolean;
}

export interface IViewElementUpdateable  extends UpdateListener {
	key		:string;
	name	:string; 
	nameEdit:string; 
	valid	:boolean;
}

class UpdateListener{

	protected guid = StringFunctions.uuidv4();
	public listenersKeyed	= {};
	public listenersEvents 	= {};

	
		

	protected callUpdateListeners(event){
		if (!this.listenersEvents[event]){
			return;
		}

		const keys = Object.keys(this.listenersEvents[event]);
		for(let i = 0; i < keys.length ; i++){
			const key = keys[i]; 
			this.listenersEvents[event][key].call();
		} 
	}
	addEventListener( key , event:string ,  listener : () => any ){
		
		if (!this.listenersEvents[event]){
			this.listenersEvents[event] = {};
		}

		if (!this.listenersKeyed[key]){
			this.listenersKeyed[key] = {};
		}
 
		this.listenersKeyed[key][event] = listener;
		this.listenersEvents[event][key] = listener;
	}

	removeEventListener( key ){

		// first get all events 
		let events = Object.keys ( this.listenersKeyed[key] );
		for (let i = 0; i < events.length; i++) {
			const e = events[i];

			//delete this key from all events 
			delete this.listenersEvents[e][key]	;
		}

		// delte this key 
		delete this.listenersKeyed[key];
	}
	removeAllEventListeners(){
		this.listenersKeyed		= {};
		this.listenersEvents 	= {};
	}
}
enum updateEvents { 
	validChange = 'ValidUpdated',
	update='update',

}




export class UISystem extends UpdateListener{

	sys		: TTRPGSystemJSONFormatting;
	groups	: UIGroup[] = [];
	valid : boolean = true;

	constructor( system : TTRPGSystemJSONFormatting){
		super();
		this.sys = system;
		this.valid = true; 
		let groups = ['derived','fixed'];
		for (let i = 0; i < groups.length; i++) {
			const grp = this.sys.data[groups[i]] as GrobGroup<GrobNodeType>;;
			const uigrp = new UIGroup(this , grp);

			this.groups.push(uigrp); 
			this.valid = this.valid && uigrp.valid;
			uigrp.addEventListener( this.guid , updateEvents.validChange , this.update.bind(this) );
		}
	}

	update(){
 
		let orig = this.valid;

		var isValid = true;
		this.groups.forEach(p => {
			isValid = isValid && p.valid;
		})
		this.valid 		= isValid; 

		if (orig != this.valid){
			this.callUpdateListeners(  updateEvents.validChange  );
		}
		this.callUpdateListeners(  updateEvents.update  );
	}
	
	public addCollection( group:string ){

	}
	public remCollection( group:string ){

	}
	public updCollection( group:string ){

	}



}
export class UIGroup extends UpdateListener implements IViewElementUpdateable{


	sys			: UISystem;
	link		: GrobGroup<GrobNodeType>;
	collections : UICollection[] = [];
	key			: string;
	name		: string;
	nameEdit	: string;
	valid		: boolean;

	constructor( system : UISystem, group : GrobGroup<GrobNodeType> ){
		super();
		this.sys = system;
		this.link = group;
		
		this.key = group.getKey();
		this.name= group.getName();
		this.nameEdit = this.name;

		var isValid = true;
		var colNames = group.getCollectionsNames();
		for (let i = 0; i < colNames.length; i++) {
			const n = colNames[i];
			const col = group.getCollection(n);

			if(!col)
				continue;

			const uicol = new UICollection( this.sys , col );
			this.collections.push(uicol);	 
			isValid = isValid && uicol.valid;

			uicol.addEventListener(this.key, updateEvents.validChange , this.isValidUpdate.bind(this) );
		}
		this.valid = isValid;
		
		
	}

	isValidUpdate(){

		let orig = this.valid;

		var isValid = true;
		this.collections.forEach(p => {
			isValid = isValid && p.valid;
		})
		this.valid 		= isValid;

		if (orig != this.valid){
			this.callUpdateListeners( updateEvents.validChange );
		}
	}

	update(){

		this.key		= this.link.getKey();
		this.name   	= this.link.getName();
		this.nameEdit 	= this.link.getName();
		this.isValidUpdate();
	}
	
	dispose(){
		
		this.removeAllEventListeners();
		this.collections.forEach( n => n.dispose() );

		//@ts-ignore
		this.link = null;
		//@ts-ignore
		this.sys = null;

		this.collections = [];
	}
}
export class UICollection extends UpdateListener implements IViewElementUpdateable{

	sys	 	: UISystem;
	link	: GrobCollection<GrobNodeType>;
	nodes   : UINode[]= [];
	key	 	: string;
	name	: string;
	nameEdit: string;
	valid   : boolean;
	
	constructor( system : UISystem , col : GrobCollection<GrobNodeType> ){
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

			if(!node)
				continue;

			const uinode = new UINode( this.sys , node );
			this.nodes.push(uinode);	 
			isValid = isValid && uinode.valid;

			uinode.addEventListener(this.key, updateEvents.validChange , this.isValidUpdate.bind(this) );
		}

		this.link.addUpdateListener(this.key, this.update.bind(this) );
		this.valid = isValid;
	}

	isValidUpdate(){
		var orig = this.valid;

		var isValid = true;
		this.nodes.forEach(p => {
			isValid = isValid && p.valid;
		})
		this.valid 		= isValid;

		if (orig != this.valid){
			this.callUpdateListeners( updateEvents.validChange );
		}
	}

	update(){
 
		this.key		= this.link.getKey();
		this.name   	= this.link.getName();
		this.nameEdit 	= this.link.getName();
		this.isValidUpdate();
	}
	
	dispose(){

		// get rid of node listener
		this.link.removeUpdateListener( this.key );
		this.removeAllEventListeners();
		
		// dispose of all children. 
		this.nodes.forEach( n => n.dispose() );

		//@ts-ignore
		this.link = null;
		//@ts-ignore
		this.sys = null;

		this.nodes = [];
	}


}
export class UINode extends UpdateListener implements IViewElementUpdateable{

	sys		: UISystem;
	link	: GrobNodeType;
	key		: string;
	name	: string;
	nameEdit: string;	 
	valid   : boolean;
	
	constructor( system : UISystem, node : GrobNodeType){
		super();
		this.link = node;
		this.sys = system;

		this.key	= node.getKey();
		this.name   = node.getName();
		this.nameEdit = node.getName();
		this.valid = node.isValid();	
		
		this.link.addUpdateListener( this.key , this.update.bind(this) );
	}

	update(){ 
		let validOrig = this.valid;

		this.key		= this.link.getKey();
		this.name   	= this.link.getName();
		this.nameEdit 	= this.link.getName();
		this.valid 		= this.link.isValid();
 
		if (validOrig != this.valid){
			this.callUpdateListeners( updateEvents.validChange );
		}
		this.callUpdateListeners( updateEvents.update );
	}
	
	dispose(){

		this.removeAllEventListeners();
		this.link.removeUpdateListener( this.key );
		//@ts-ignore
		this.link = null;
		//@ts-ignore
		this.sys = null;
	}

}