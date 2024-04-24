import { JsonObject } from "../Decorators";
import { JSONHandler, JsonProperty } from  "../index";

@JsonObject({ 
	onAfterDeSerialization:(self:Container2) => { 
		self.onlyA = (self.onlyA ?? 0) + 1; 
	},
	scheme : 'A'
})
@JsonObject({ 
	onAfterDeSerialization:(self:Container2) => { 
		self.onlyB = (self.onlyB ?? 0) + 1; 
	},
	scheme : 'B'
})
@JsonObject({ 
	onAfterDeSerialization:(self:Container2) => { 
		self.simple = (self.simple ?? 0) + 1; 
	}
})
export class Container2 {
	
	constructor(){}
  
	@JsonProperty()
	public simple : number | null = 2;
	
	@JsonProperty({scheme:'A'})
	public onlyA : number | null = 2;
	 
	@JsonProperty({scheme:'B'})
	public onlyB : number | null = 2;
}
export class Container {
	
	constructor(){}
  
	@JsonProperty()
	public simple : number | null = 2;
	
	@JsonProperty({scheme:'A'})
	public onlyA : number | null = 2;
	 
	@JsonProperty({scheme:'B'})
	public onlyB : number | null = 2;
}

test('Simple object To Bool and Bool Array Conversions', () => {
	let c = new Container(); 

	// serialize Basic
	let ser = JSONHandler.serialize(c)
	expect(ser).toEqual(JSON.stringify({simple:2}))
	
	// serialize A 
	ser = JSONHandler.serialize(c,'A')
	expect(ser).toEqual(JSON.stringify({onlyA:2}))
	
	// serialize B
	ser = JSONHandler.serialize(c,'B')
	expect(ser).toEqual(JSON.stringify({onlyB:2}))
})


test('On After Conversions With Schemes ', () => {
	let c = new Container2(); 

	// serialize Basic
	let ser = JSONHandler.serialize(c)
	let des = JSONHandler.deserialize(Container2,ser);
	expect(des.simple).toEqual(3)
	
	// serialize A 
	ser = JSONHandler.serialize(c,'A')
	des = JSONHandler.deserialize(Container2,ser,'A');
	expect(des.onlyA).toEqual(3) 
	
	// serialize B
	ser = JSONHandler.serialize(c,'B')
	des = JSONHandler.deserialize(Container2,ser,'B');
	expect(des.onlyB).toEqual(3)  
})