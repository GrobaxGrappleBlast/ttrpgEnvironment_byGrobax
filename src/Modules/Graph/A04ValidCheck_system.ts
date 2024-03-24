import { group } from "console";
import { Collection } from "../Designer/Collection";
import { Group } from "../Designer/Group";
import type { IOutputHandler } from "../Designer/Abstractions/IOutputHandler";
import { Nodte, derivedNode, fixedNode, type NodeType } from "../Designer/Nodte";
import { type typeSystemKeys } from "./A01BaseAccess_System";
import { AGraph_System } from "./A03Graph_System";

/**
 * Handles Validation Checks, checks for whether or not an action can be performed
 * asummes higher levels does not exists, and that errors Can only exists according to instance existances. 
 */
export abstract class AValidCheck_system extends AGraph_System {

	private nodeExistCheck(groupKey: string, colKey: string, nodeKey: string, out: IOutputHandler, outMsgAttachment: string = '') {

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(groupKey)) {
			out.outError(`${outMsgAttachment} groupKey Does ${groupKey} not exist on system`);
			return false;
		}

		// if everything is fine, no need to look for a good error message. 
		// @ts-ignore
		if (this._hasNode(groupKey, colKey, nodeKey)) {
			return true;
		}

		// else figure out what is wrong and create the error message
		if (!this._hasGroup(groupKey as typeSystemKeys)) {
			out.outError(`${outMsgAttachment} groupKey Does not exist on system`);
		}
		else if (!this._hasCollection(groupKey as typeSystemKeys, colKey)) {
			out.outError(`${outMsgAttachment} CollectionKey ${colKey} Does not exist on group ${groupKey}`);
		}
		else {
			out.outError(`${outMsgAttachment} Node ${nodeKey} does not exists on ${groupKey}.${colKey}`);
		}
		return false;

	}

	private readonly out: IOutputHandler | null = {
		outError: function (msg: any) {
			console.error(msg);
		},
		outLog: function (msg: any) {
			console.log(msg)
		}
	}

	public createCollection(groupKey:string , colKey:string, out: IOutputHandler | null = null){
		// we ensure the out interface is used. 
		if (out == null) {
			out = this.out as IOutputHandler;
		}

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(groupKey)) {
			out.outError(`CREATE: groupKey Does ${groupKey} not exist on system`);
			return false;
		}
		let _groupkey = groupKey as typeSystemKeys;

		super._createCollection(_groupkey,colKey,out);
	}

	public createNode(groupKey: string, colKey: string, nodeKey: string, out: IOutputHandler | null = null) {

		// we ensure the out interface is used. 
		if (out == null) {
			out = this.out as IOutputHandler;
		}

		/// we do not use nodeExistCheck because we need it to do, all but check if the node exists, so this is custom 

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(groupKey)) {
			out.outError(`CREATE: groupKey Does ${groupKey} not exist on system`);
			return undefined;
		}
		let _groupkey = groupKey as typeSystemKeys;

		// ensure node does not exist
		if (this._hasNode(_groupkey, colKey, nodeKey)) {
			out.outError('CREATE: Node Already Exist, call update instead');
			return undefined;
		}
 
		if (!this._hasCollection(_groupkey, colKey)) {
			this.createCollection(_groupkey,colKey);	 
		}
		
		return super._createNode(_groupkey,colKey,nodeKey,out);
	}

	public updateNode(oldGroupKey: string, oldCollectionKey: string, oldNodeKey: string, nodeobj: NodeType, out: IOutputHandler | null = null) {

		// we ensure the out interface is used. 
		if (out == null) {
			out = this.out as IOutputHandler;
		}

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(oldGroupKey)) {
			out.outError(`CREATE: groupKey Does ${oldGroupKey} not exist on system`);
			return false;
		}
		let _groupkey = oldGroupKey as typeSystemKeys;

		// check that the node exist
		if (!this.nodeExistCheck(oldGroupKey, oldCollectionKey, oldNodeKey, out, 'UPDATE:')) {
			return null;
		}
		
		super._updateNode(_groupkey,oldCollectionKey,oldNodeKey,nodeobj,out);
	}

	public deleteNode(groupKey: string, collectionKey: string, nodeKey: string, out: IOutputHandler | null = null) {

		// we ensure the out interface is used. 
		if (out == null) {
			out = this.out as IOutputHandler;
		}

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(groupKey)) {
			out.outError(`CREATE: groupKey Does ${groupKey} not exist on system`);
			return false;
		}
		let _groupkey = groupKey as typeSystemKeys;

		// check that the node exist
		if (!this.nodeExistCheck(groupKey, collectionKey, nodeKey, out, 'DELETE:')) {
			return null;
		}
		
		super._deleteNode(_groupkey,collectionKey,nodeKey,out);
	}

	public getNode(groupKey: string, collectionKey: string, nodeKey: string, out: IOutputHandler | null = null) : NodeType | undefined{

		// we ensure the out interface is used. 
		if (out == null) {
			out = this.out as IOutputHandler;
		}

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(groupKey)) {
			out.outError(`CREATE: groupKey Does ${groupKey} not exist on system`);
			return undefined;
		}
		let _groupkey = groupKey as typeSystemKeys;

		// check that the node exist
		if (!this.nodeExistCheck(groupKey, collectionKey, nodeKey, out, 'GET:')) {
			return undefined;
		}

		return super._getNode(_groupkey, collectionKey, nodeKey );
	}

	public updateCollection(groupKey: string, collectionKey: string, col: Collection<NodeType>, out: IOutputHandler | null = null){
		
		// we ensure the out interface is used. 
		if (out == null) {
			out = this.out as IOutputHandler;
		}

		// Ensure group key is a group key
		if (!this.isOfTypeASystemKeys(groupKey)) {
			out.outError(`UPDATE: groupKey Does ${groupKey} not exist on system`);
			return undefined;
		}
		let _groupkey = groupKey as typeSystemKeys;
	
			// check that the Collection exist
		if (!this._hasCollection(_groupkey, collectionKey)) {
			out.outError(`UPDATE: Collection  ${collectionKey} does not exist on group  ${groupKey}`);
			return undefined;
		}
		
		this._updateCollection(_groupkey,collectionKey,col,out);
	}


}