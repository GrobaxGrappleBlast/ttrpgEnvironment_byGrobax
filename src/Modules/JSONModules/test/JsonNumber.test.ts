import exp from "constants";
import { JSONHandler, JsonArrayNumber, JsonNumber, JsonProperty 
	
} from "../Decorators";

interface hasInit{
	init()
	nulify()
}



export class NumberContainer implements hasInit {
	
	constructor(){}

	public init(){	
		this.simple = 1;
		this.array = [1, 1, 1];
		this.simple2 = 1;
		this.array2 = [1, 1, 1];
	}

	public invert(){
		this.simple = -1 *( this.simple ?? 0);
		this.array 	= 	this.array?.map( p => -1 * p) ?? null;
		this.simple2=  -1 *( this.simple2 ?? 0);
		this.array2 = this.array2?.map( p => -1 * p) ?? null;
	}

	public nulify(){	
		this.simple = null;
		this.array 	= null;
		this.simple2= null;
		this.array2 = null;
	}
	
	@JsonNumber()
	public simple : number | null;
	
	@JsonArrayNumber()	
	public array : number[] | null;

	@JsonNumber({name:"t"})
	public simple2 : number | null;
	
	@JsonArrayNumber({name:"x"})	
	public array2 : number[] | null;
}

export class NumberContainer_bool  implements hasInit {
	
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

	@JsonNumber()
	public simple: boolean | null;
	@JsonArrayNumber()
	public array:  boolean[] | null;

	@JsonNumber({name:"t"})
	public simple2:  boolean | null;
	@JsonArrayNumber({name:"x"})	
	public array2:  boolean[] | null;
}

export class NumberContainer_string  implements hasInit {
	
	constructor(){}

	public init(){	
		this.simple =  "1" 
		this.array 	= ["1"]
		this.simple2=  "1.1"
		this.array2 =  ["1.1"]
	}

	public invert(){
		this.simple 	= "-1"	;
		this.array 		= ["-1"]  ;
		this.simple2	= "-1.1";
		this.array2 	= ["-1.1"];
	}
	public nulify(){	
		this.simple =  "";
		this.array 	= [""];
		this.simple2= 	"";
		this.array2 = [""];
	}

	// integer
	@JsonNumber()
	public simple: string;
	@JsonArrayNumber()	
	public array: string[];
	
	// float
	@JsonNumber({name:"t"})
	public simple2: string;
	@JsonArrayNumber({name:"x"})
	public array2: string[];
 
}
 

export class NumberPiece{

	public constructor(){}

	@JsonProperty({name:"myString"})
	public t1: string = "strValue";

	@JsonProperty({name:"myBool"})
	public t2: boolean = true;

	@JsonProperty({name:"myInteger"})
	public t3: number = 1;

	public tt1: string = "strValue";
	public tt2: boolean = true;
	public tt3: number = 1;
		
}
export class NumberContainer_object  implements hasInit {
	
	constructor(){}

	public init(){	
		this.simple = {name:"ornfreyd"};

		//@ts-ignore
		this.array = {name:"Jeffrey"};
		this.simple2 =   new NumberPiece();
		this.array2 =	[new NumberPiece()];
	}
	public nulify(){	
		this.simple	= null;
		this.array	= null;
		this.simple2= null;
		this.array2	= null;
	}

	@JsonArrayNumber({name:"x"})
	public array2: object[] | null;

	@JsonNumber()
	public simple: object | null ;

	@JsonArrayNumber()	
	public array: object[] | null ;
		
	@JsonNumber({name:"t"})
	public simple2: object | null;


}


function startTest( c, type : any = NumberContainer ){
	var json = JSONHandler.serialize(c);
	var deser= JSONHandler.deserialize(type,json); 
	return [c,json,deser];
}

test('Simple Conversions', () => {
	let c = new NumberContainer();
	// TRUE CHECKS 
	c.init();
	var [orig, json, des ] = startTest( c , NumberContainer);
	
	// test the simple boolean value
	expect(des.simple ).toBe(orig.simple )
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
		JSON.stringify(JSON.parse(`{"simple":1,"array":[1,1,1],"t":1,"x":[1,1,1]}`))
	);

	// FALSE CHECKS 
	// invert and try again
	c.invert();
	[orig, json, des ] = startTest( c , NumberContainer);

	// test the simple boolean value
	expect(des.simple ).toBe(orig.simple )
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
		JSON.stringify(JSON.parse(`{"simple":-1,"array":[-1,-1,-1],"t":-1,"x":[-1,-1,-1]}`))
		
	);

	// NULL CHECKS
	c.nulify();
	[orig, json, des ] = startTest( c , NumberContainer );
 

	// test the simple boolean value
	expect(des.simple ).toBe(0)
	expect(des.simple2).toBe(0)

	// test the array;
	expect(des.array .length).toBe(0);
	expect(des.array2.length).toBe(0);

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":0,"array":[],"t":0,"x":[]}`))
	)
})


test('Simple bool To number and string Array Conversions', () => {
	let c = new NumberContainer_bool();
	// TRUE CHECKS 
	c.init();
	var [orig, json, des ] = startTest( c , NumberContainer_bool );
	
	// test the simple boolean value
	expect(des.simple ).toBe(1)
	expect(des.simple2).toBe(1)

	// test the array;
	expect(des.array.length).toBe(orig.array.length);
	for (let i = 0; i < orig.array.length; i++) {
		expect(des.array [i]).toBe(1);
		expect(des.array2[i]).toBe(1);
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":1,"array":[1],"t":1,"x":[1]}`))
	);

	// FALSE CHECKS 
	// invert and try again
	c.invert();
	[orig, json, des ] = startTest( c , NumberContainer_bool);

	// test the simple boolean value
	expect(des.simple).toBe (0)
	expect(des.simple2).toBe(0)

	// test the array;
	expect(des.array .length).toBe(orig.array.length);
	expect(des.array2.length).toBe(orig.array.length);
	for (let i = 0; i < orig.array.length; i++) {
		expect(des.array [i]).toBe(0);
		expect(des.array2[i]).toBe(0);
	}

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":0,"array":[0],"t":0,"x":[0]}`))
		
	);

	// NULL CHECKS
	c.nulify();
	[orig, json, des ] = startTest( c , NumberContainer_bool);
 

	// test the simple boolean value
	expect(des.simple).toBe(0)
	expect(des.simple2).toBe(0)

	// test the array;
	expect(des.array .length).toBe(0);
	expect(des.array2.length).toBe(0);

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":0,"array":[],"t":0,"x":[]}`))
	)
})

test('Simple string To number and string Array Conversions', () => {
	let c = new NumberContainer_string();
	// TRUE CHECKS 
	c.init();
	var [orig, json, des ] = startTest( c , NumberContainer_string);
	
	// test the simple boolean value
	expect(des.simple ).toBe(1)
	expect(des.simple2).toBe(1.1)

	// test the array;
	expect(des.array.length).toBe(orig.array.length); 
	expect(des.array [0]).toBe(1);
	expect(des.array2[0]).toBe(1.1);

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":1,"array":[1],"t":1.1,"x":[1.1]}`))
	);

	// FALSE CHECKS 
	// invert and try again
	c.invert();
	[orig, json, des ] = startTest( c , NumberContainer_string );

	// test the simple boolean value
	expect(des.simple ).toBe(-1)
	expect(des.simple2).toBe(-1.1)

	// test the array;
	expect(des.array.length).toBe(orig.array.length); 
	expect(des.array [0]).toBe(-1);
	expect(des.array2[0]).toBe(-1.1);

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":-1,"array":[-1],"t":-1.1,"x":[-1.1]}`))
		
	);

	// NULL CHECKS
	c.nulify();
	[orig, json, des ] = startTest( c , NumberContainer_string);
 

	// test the simple boolean value
	expect(des.simple ).toBe(0)
	expect(des.simple2).toBe(0)

	// test the array;
	expect(des.array .length).toBe(1);
	expect(des.array2.length).toBe(1);
	expect(des.array [0]).toBe(0);
	expect(des.array2[0]).toBe(0);

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":0,"array":[0],"t":0,"x":[0]}`))
	)

})
 
test('Simple object To number and string Array Conversions', () => {
	let c = new NumberContainer_object();
	// TRUE CHECKS 
	c.init();
	var [orig, json, des ] = startTest( c , NumberContainer_object);
	
	// test the simple boolean value
	expect(des.simple ).toBe(1)
	expect(des.simple2).toBe(1)

	// test the array;
	expect(des.array .length).toBe(1); 
	expect(des.array2.length).toBe(1); 
	expect(des.array [0]).toBe(1);
	expect(des.array2[0]).toBe(1);

	expect(
		JSON.stringify(JSON.parse(json))
	).toBe(
		JSON.stringify(JSON.parse(`{"simple":1,"array":[1],"t":1,"x":[1]}`))
	);

	
})

 