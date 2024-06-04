import { JSONHandler, JsonArrayBoolean, JsonBoolean, JsonMapping, JsonMappingRecordInArrayOut, JsonProperty } from "../index";

interface hasInit{
	init()
	nulify()
}
export class BoolContainer implements hasInit {
	
	constructor(){}

	public init(){	
		this.simple = true;
		this.array = [true, true, true];
		this.simple2 = true;
		this.array2 = [true, true, true];
	}

	public invert(){
		this.simple = false;
		this.array 	= [false, false, false];
		this.simple2= false;
		this.array2 = [false, false, false];
	}

	public nulify(){	
		this.simple = null;
		this.array 	= null;
		this.simple2= null;
		this.array2 = null;
	}
	
	@JsonBoolean()
	public simple : boolean | null;
	
	@JsonArrayBoolean()	
	public array : boolean[] | null;

	@JsonBoolean({name:"t"})
	public simple2 : boolean | null;
	
	@JsonArrayBoolean({name:"x"})	
	public array2 : boolean[] | null;
}

export class BoolContainer_string  implements hasInit {
	
	constructor(){}

	public init(){	
		this.simple = "maybe";
		this.array = "maybearr";
		this.simple2= "WhoKnows";
		this.array2 = "WhoKnows";
	}

	public nulify(){	
		this.simple = "";
		this.array 	= "";
		this.simple2= "";
		this.array2 = "";
	}
	@JsonBoolean()
	public simple: string;
	@JsonArrayBoolean()
	public array: string;

	@JsonBoolean({name:"t"})
	public simple2: string;
	@JsonArrayBoolean({name:"x"})	
	public array2: string;
}

export class BoolContainer_number  implements hasInit {
	
	constructor(){}

	public init(){	
		this.simple =  1 
		this.array 	= [1]
		this.simple2=  1.1
		this.array2 =  [1.1]
	}

	public invert(){
		this.simple = this.simple 	;
		this.array 	= this.array 	;
		this.simple2= this.simple2	;
		this.array2 = this.array2 	;
	}
	public nulify(){	
		this.simple = 	0;
		this.array 	= [0];
		this.simple2= 	0;
		this.array2 = [0];
	}

	// integer
	@JsonBoolean()
	public simple: number;
	@JsonArrayBoolean()	
	public array: number[];
	
	// float
	@JsonBoolean({name:"t"})
	public simple2: number;
	@JsonArrayBoolean({name:"x"})
	public array2: number[];
 
}

export class BoolContainer_object  implements hasInit {
	
	constructor(){}

	public init(){	
		this.simple = {name:"ornfreyd"};

		//@ts-ignore
		this.array = {name:"Jeffrey"};
		this.simple2 = {name:"ornfreyd"};
		this.array2 =	[{name:"Jeffrey"}];
	}
	public nulify(){	
		this.simple	= null;
		this.array	= null;
		this.simple2= null;
		this.array2	= null;
	}

	@JsonBoolean()
	public simple: object | null ;

	@JsonArrayBoolean()	
	public array: object[] | null ;
		
	@JsonBoolean({name:"t"})
	public simple2: object | null;

	@JsonArrayBoolean({name:"x"})
	public array2: object[] | null;

}


function startTest( c ){
	var json = JSONHandler.serialize(c);
	var deser= JSONHandler.deserialize(BoolContainer,json); 
	return [c,json,deser];
}

test('Simple Conversions', () => {
	let c = new BoolContainer();
	// TRUE CHECKS 
	c.init();
	var [orig, json, des ] = startTest( c );
	
	// test the simple boolean value
	expect(des.simple).toBe(orig.simple)
	expect(des.simple2).toBe(true)

	// test the array;
	expect(des.array.length).toBe(orig.array.length);
	for (let i = 0; i < orig.array.length; i++) {
		expect(des.array [i]).toBe(orig.array[i]);
		expect(des.array2[i]).toBe(orig.array[i]);
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":true,"array":[true,true,true],"t":true,"x":[true,true,true]}`))
	);

	// FALSE CHECKS 
	// invert and try again
	(orig as BoolContainer).invert();
	[orig, json, des ] = startTest( orig );

	// test the simple boolean value
	expect(des.simple).toBe(false)
	expect(des.simple2).toBe(false)

	// test the array;
	expect(des.array .length).toBe(orig.array.length);
	expect(des.array2.length).toBe(orig.array.length);
	for (let i = 0; i < orig.array.length; i++) {
		expect(des.array [i]).toBe(orig.array[i]);
		expect(des.array2[i]).toBe(orig.array[i]);
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":false,"array":[false,false,false],"t":false,"x":[false,false,false]}`))
	);

	// NULL CHECKS
	(orig as BoolContainer).nulify();
	[orig, json, des ] = startTest( orig );
 

	// test the simple boolean value
	expect(des.simple).toBe(false)
	expect(des.simple2).toBe(false)

	// test the array;
	expect(des.array .length).toBe(0);
	expect(des.array2.length).toBe(0);

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":false,"array":[],"t":false,"x":[]}`))
	)
})

test('Simple string To Bool and Bool Array Conversions', () => {
	let c = new BoolContainer_string();
	// With String value checks 
	c.init();
	var [orig, json, des ] = startTest( c );
	
	// test the simple boolean value
	expect(des.simple).toBe(true) 
	expect(des.simple2).toBe(true) 

	// test the array;
	expect(des.array.length).toBe(1);
	expect(des.array2.length).toBe(1);
	for (let i = 0; i < 1; i++) {
		expect(des.array [i]).toBe( true ); 
		expect(des.array2 [i]).toBe( true ); 
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":true,"array":[true],"t":true,"x":[true]}`))
	);


	c.nulify();
	var [orig, json, des ] = startTest( c );
	
	// test the simple boolean value
	expect(des.simple).toBe(false) 
	expect(des.simple2).toBe(false) 

	// test the array;
	expect(des.array .length).toBe(0);
	expect(des.array2.length).toBe(0); 

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":false,"array":[],"t":false,"x":[]}`))
	);
})

test('Simple Number To Bool and Bool Array Conversions', () => {
	let c = new BoolContainer_number(); 
	c.init();
	var [orig, json, des ] = startTest( c );
	
	// test the simple boolean value
	expect(des.simple).toBe(true) 
	expect(des.simple2).toBe(true) 

	// test the array;
	expect(des.array .length).toBe(1);
	expect(des.array2.length).toBe(1);
	for (let i = 0; i < 1; i++) {
		expect(des.array [i]).toBe( true ); 
		expect(des.array2 [i]).toBe( true ); 
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":true,"array":[true],"t":true,"x":[true]}`))
	);

	// negative numbers 
	c.invert();
	var [orig, json, des ] = startTest( c );
	
	// test the simple boolean value
	expect(des.simple).toBe(true) 
	expect(des.simple2).toBe(true) 

	// test the array;
	expect(des.array .length).toBe(1);
	expect(des.array2.length).toBe(1);
	for (let i = 0; i < 1; i++) {
		expect(des.array [i]).toBe( true ); 
		expect(des.array2 [i]).toBe( true ); 
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":true,"array":[true],"t":true,"x":[true]}`))
	);

	// ZERO Checks
	c.nulify();
	var [orig, json, des ] = startTest( c );
	
	// test the simple boolean value
	expect(des.simple).toBe(false) 
	expect(des.simple2).toBe(false) 

	// test the array;
	expect(des.array .length).toBe(1);
	expect(des.array2.length).toBe(1);
	for (let i = 0; i < 1; i++) {
		expect(des.array [i]).toBe( false ); 
		expect(des.array2 [i]).toBe( false ); 
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":false,"array":[false],"t":false,"x":[false]}`))
	);
})

test('Simple object To Bool and Bool Array Conversions', () => {
	let c = new BoolContainer_object(); 
	c.init();
	var [orig, json, des ] = startTest( c );
	
	// test the simple boolean value
	expect(des.simple).toBe(true) 
	expect(des.simple2).toBe(true) 

	// test the array;
	expect(des.array .length).toBe(1);
	expect(des.array2.length).toBe(1);
	for (let i = 0; i < 1; i++) {
		expect(des.array [i]).toBe( true ); 
		expect(des.array2 [i]).toBe( true ); 
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":true,"array":[true],"t":true,"x":[true]}`))
	);

	c.nulify();
	var [orig, json, des ] = startTest( c );
	
	// test the simple boolean value
	expect(des.simple).toBe(false) 
	expect(des.simple2).toBe(false) 

	// test the array;
	expect(des.array .length).toBe(0);
	expect(des.array2.length).toBe(0);
	
	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":false,"array":[],"t":false,"x":[]}`))
	);
})

