import { JSONHandler, JsonArrayBoolean, JsonArrayString, JsonBoolean, JsonMapping, JsonMappingRecordInArrayOut, JsonNumber, JsonProperty, JsonString } from  "../index";

interface hasInit{
	init()
	nulify()
}



export class StringContainer implements hasInit {
	
	constructor(){}

	public init(){	
		this.simple = "true";
		this.array = ["true", "true", "true"];
		this.simple2 = "true";
		this.array2 = ["true", "true", "true"];
	}

	public invert(){
		this.simple = "";
		this.array 	= ["", "", ""];
		this.simple2= "";
		this.array2 = ["", "", ""];
	}

	public nulify(){	
		this.simple = null;
		this.array 	= null;
		this.simple2= null;
		this.array2 = null;
	}
	
	@JsonString()
	public simple : string | null;
	
	@JsonArrayString()	
	public array : string[] | null;

	@JsonString({name:"t"})
	public simple2 : string | null;
	
	@JsonArrayString({name:"x"})	
	public array2 : string[] | null;
}

export class StringContainer_bool  implements hasInit {
	
	constructor(){}

	public init(){	
		this.simple = true;
		this.array 	= [true];
		this.simple2= true;
		this.array2 = [true];
	}

	public invert(){	
		this.simple = false;
		this.array 	= [false];
		this.simple2= false;
		this.array2 = [false];
	}

	public nulify(){	
		this.simple = null;
		this.array 	= null;
		this.simple2= null;
		this.array2 = null;
	}

	@JsonString()
	public simple: boolean | null;
	@JsonArrayString()
	public array:  boolean[] | null;

	@JsonString({name:"t"})
	public simple2:  boolean | null;
	@JsonArrayString({name:"x"})	
	public array2:  boolean[] | null;
}

export class StringContainer_number  implements hasInit {
	
	constructor(){}

	public init(){	
		this.simple =  1 
		this.array 	= [1]
		this.simple2=  1.1
		this.array2 =  [1.1]
	}

	public invert(){
		this.simple = -1 * this.simple 	;
		this.array[0] 	= -1 * this.array[0] 	;
		this.simple2= -1 * this.simple2	;
		this.array2[0] = -1 * this.array2[0] 	;
	}
	public nulify(){	
		this.simple = 	0;
		this.array 	= [0];
		this.simple2= 	0;
		this.array2 = [0];
	}

	public nulify2(){	
		this.simple = 	0;
		//@ts-ignore
		this.array 	= 	0;
		this.simple2= 	0;
		//@ts-ignore
		this.array2 = 	0;
	}

	// integer
	@JsonString()
	public simple: number;
	@JsonArrayString()	
	public array: number[];
	
	// float
	@JsonString({name:"t"})
	public simple2: number;
	@JsonArrayString({name:"x"})
	public array2: number[];
 
}


export class StringPiece{

	public constructor(){}

	@JsonString({name:"myString"})
	public t1: string = "strValue";

	@JsonBoolean({name:"myBool"})
	public t2: boolean = true;

	@JsonNumber({name:"myInteger"})
	public t3: number = 1;

	public tt1: string = "strValue";
	public tt2: boolean = true;
	public tt3: number = 1;
		
}
export class StringContainer_object  implements hasInit {
	
	constructor(){}

	public init(){	
		this.simple = {name:"ornfreyd"};

		//@ts-ignore
		this.array = {name:"Jeffrey"};
		this.simple2 =   new StringPiece();
		this.array2 =	[new StringPiece()];
	}
	public nulify(){	
		this.simple	= null;
		this.array	= null;
		this.simple2= null;
		this.array2	= null;
	}

	@JsonArrayString({name:"x"})
	public array2: object[] | null;

	@JsonString()
	public simple: object | null ;

	@JsonArrayString()	
	public array: object[] | null ;
		
	@JsonString({name:"t"})
	public simple2: object | null;


}


function startTest( c, type : any = StringContainer ){
	var json = JSONHandler.serialize(c);
	var deser= JSONHandler.deserialize(type,json); 
	return [c,json,deser];
}

test('Simple Conversions', () => {
	let c = new StringContainer();
	// TRUE CHECKS 
	c.init();
	var [orig, json, des ] = startTest( c );
	
	// test the simple boolean value
	expect(des.simple).toBe(orig.simple)
	expect(des.simple2).toBe(orig.simple2)

	// test the array;
	expect(des.array.length).toBe(orig.array.length);
	for (let i = 0; i < orig.array.length; i++) {
		expect(des.array [i]).toBe(orig.array	[i]);
		expect(des.array2[i]).toBe(orig.array2	[i]);
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":"true","array":["true","true","true"],"t":"true","x":["true","true","true"]}`))
	);

	// FALSE CHECKS 
	// invert and try again
	c.invert();
	[orig, json, des ] = startTest( c );

	// test the simple boolean value
	expect(des.simple).toBe(orig.simple)
	expect(des.simple2).toBe(orig.simple2)

	// test the array;
	expect(des.array .length).toBe(orig.array.length);
	expect(des.array2.length).toBe(orig.array.length);
	for (let i = 0; i < orig.array.length; i++) {
		expect(des.array [i]).toBe(orig.array [i]);
		expect(des.array2[i]).toBe(orig.array2[i]);
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":"","array":["","",""],"t":"","x":["","",""]}`))
		
	);

	// NULL CHECKS
	c.nulify();
	[orig, json, des ] = startTest( c );
 

	// test the simple boolean value
	expect(des.simple).toBe("")
	expect(des.simple2).toBe("")

	// test the array;
	expect(des.array .length).toBe(0);
	expect(des.array2.length).toBe(0);

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":"","array":[],"t":"","x":[]}`))
	)
})


test('Simple bool To string and string Array Conversions', () => {
	let c = new StringContainer_bool();
	// TRUE CHECKS 
	c.init();
	var [orig, json, des ] = startTest( c );
	
	// test the simple boolean value
	expect(des.simple).toBe(orig.simple +"")
	expect(des.simple2).toBe(orig.simple2 +"")

	// test the array;
	expect(des.array.length).toBe(orig.array.length);
	for (let i = 0; i < orig.array.length; i++) {
		expect(des.array [i]).toBe(orig.array	[i]+ "");
		expect(des.array2[i]).toBe(orig.array2	[i]+ "");
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":"true","array":["true"],"t":"true","x":["true"]}`))
	);

	// FALSE CHECKS 
	// invert and try again
	c.invert();
	[orig, json, des ] = startTest( c );

	// test the simple boolean value
	expect(des.simple).toBe (orig.simple  + "")
	expect(des.simple2).toBe(orig.simple2 + "")

	// test the array;
	expect(des.array .length).toBe(orig.array.length);
	expect(des.array2.length).toBe(orig.array.length);
	for (let i = 0; i < orig.array.length; i++) {
		expect(des.array [i]).toBe(orig.array [i] +"");
		expect(des.array2[i]).toBe(orig.array2[i] +"");
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":"false","array":["false"],"t":"false","x":["false"]}`))
		
	);

	// NULL CHECKS
	c.nulify();
	[orig, json, des ] = startTest( c );
 

	// test the simple boolean value
	expect(des.simple).toBe("")
	expect(des.simple2).toBe("")

	// test the array;
	expect(des.array .length).toBe(0);
	expect(des.array2.length).toBe(0);

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":"","array":[],"t":"","x":[]}`))
	)
})


test('Simple Number To string and string Array Conversions', () => {
	let c = new StringContainer_number();
	// TRUE CHECKS 
	c.init();
	var [orig, json, des ] = startTest( c );
	
	// test the simple boolean value
	expect(des.simple).toBe(orig.simple +"")
	expect(des.simple2).toBe(orig.simple2 +"")

	// test the array;
	expect(des.array.length).toBe(orig.array.length);
	for (let i = 0; i < orig.array.length; i++) {
		expect(des.array [i]).toBe(orig.array	[i]+ "");
		expect(des.array2[i]).toBe(orig.array2	[i]+ "");
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":"1","array":["1"],"t":"1.1","x":["1.1"]}`))
	);

	// FALSE CHECKS 
	// invert and try again
	c.invert();
	[orig, json, des ] = startTest( c );

	// test the simple boolean value
	expect(des.simple).toBe (orig.simple  + "")
	expect(des.simple2).toBe(orig.simple2 + "")

	// test the array;
	expect(des.array .length).toBe(orig.array.length);
	expect(des.array2.length).toBe(orig.array.length);
	for (let i = 0; i < orig.array.length; i++) {
		expect(des.array [i]).toBe(orig.array [i] +"");
		expect(des.array2[i]).toBe(orig.array2[i] +"");
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":"-1","array":["-1"],"t":"-1.1","x":["-1.1"]}`))
		
	);

	// NULL CHECKS
	c.nulify();
	[orig, json, des ] = startTest( c );
 

	// test the simple boolean value
	expect(des.simple).toBe("0")
	expect(des.simple2).toBe("0")

	// test the array;
	expect(des.array .length).toBe(1);
	expect(des.array2.length).toBe(1);
	for (let i = 0; i < orig.array.length; i++) {
		expect(des.array [i]).toBe(orig.array [i] +"");
		expect(des.array2[i]).toBe(orig.array2[i] +"");
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":"0","array":["0"],"t":"0","x":["0"]}`))
	)

	// NULL CHECKS
	c.nulify2();
	[orig, json, des ] = startTest( c );
 

	// test the simple boolean value
	expect(des.simple).toBe("0")
	expect(des.simple2).toBe("0")

	// test the array;
	expect(des.array .length).toBe(0);
	expect(des.array2.length).toBe(0);
	//for (let i = 0; i < orig.array.length; i++) {
	//	expect(des.array [i]).toBe(orig.array [i] +"");
	//	expect(des.array2[i]).toBe(orig.array2[i] +"");
	//}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":"0","array":[],"t":"0","x":[]}`))
	)
})

test('Simple object To string and string Array Conversions', () => {
	let c = new StringContainer_object(); 
	c.init();
	var [orig, json, des ] = startTest( c , StringContainer_object );
	
	function compareObject( obj1, obj2 ){
		expect( Object.keys(obj1) ).toEqual( Object.keys(obj2) )

		expect(
			Object.getPrototypeOf(obj1).constructor.name
		).toBe(
			Object.getPrototypeOf(obj2).constructor.name
		) 	
	}
	
	compareObject(des			,orig			);
	compareObject(des.simple	,JSONHandler.serialize(orig.simple)	);
	compareObject(des.simple2	,JSONHandler.serialize(orig.simple2));

	expect(des.array .length).toBe(1);
	expect(des.array2.length).toBe(1);
	for (let i = 0; i < 1; i++) {
	
		expect(
			des.array [i]
		).toBe(JSONHandler.serialize(orig.array)); 
	
		expect(
			des.array2[i]
		).toBe(JSONHandler.serialize(orig.array2[i])); 
	}
 
	
})

