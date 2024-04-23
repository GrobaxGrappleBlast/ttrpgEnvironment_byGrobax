import { JSONHandler, JsonProperty } from  "../index";

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

