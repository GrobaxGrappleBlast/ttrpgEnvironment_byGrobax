import { Group } from "./Group";
import { Nodte } from "./Nodte";

export class Collection<T extends Nodte<T>>{
	constructor(name) {
		this.name = name;
	}
	name: string
	nodes: Record<string, T> = {}
	parent: Group<T>;

	public hasNode(nodeName) {
		return this.nodes[nodeName] ? true : false;
	}
	public getNode(nodeName): T  {
		return this.nodes[nodeName];
	}
	public addNode(node: T) {
		node.parent = this;
		this.nodes[node.name] = node;
		return true;
	}

}