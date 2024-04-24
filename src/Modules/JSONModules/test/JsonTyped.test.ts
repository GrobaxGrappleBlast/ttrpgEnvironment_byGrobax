import { JSONHandler, JsonArrayBoolean, JsonArrayClassTyped, JsonArrayNumber, JsonArrayString, JsonBoolean, JsonClassTyped, JsonMappingRecordInArrayOut, JsonNumber, JsonProperty, JsonString 
	
} from  "../index";



export class SomethingElse{

	private static someValue = 0;
	public static reset(){
		this.someValue = 0;
	}
	public static getSome(){
		return 'key_' + SomethingElse.someValue++;
	}
}

var InnerPieceCounter = 0;

export class InnerPiece {

	constructor(){
		this.key = SomethingElse.getSome();
		this.KKey = InnerPieceCounter++;
		
	}

	public KKey;
	private key;
 
	public getKey(){
		return this.key;
	}
	public getKKey( index ){
		return index[0]; 
	}
	public getKK2ey( param? ){
		if( param ){
			
		}
		return this.key;
	}
	public getKK3ey( param = "asdasdad" ){
		if( param.slice(0,2) ){

		}
		return this.key;
	}
	

	@JsonString()
	public name = "HANS"

	@JsonArrayString()
	public addresser = ["1","2","3"]

	@JsonNumber()
	public id : number = 123;

	@JsonArrayNumber()
	public serials = [1,2,3]

	@JsonBoolean()
	public isValid = true;

	@JsonArrayBoolean({name:'x'})
	public subFunctions = [true,true,true]

}

export class Container {
	
	constructor(){}

	public init(){	
	 this.simple = new InnerPiece();
	 this.array= [new InnerPiece()];
	}
  
	@JsonClassTyped(InnerPiece)
	public simple : InnerPiece;

	@JsonArrayClassTyped(InnerPiece)
	public array : InnerPiece[];

	
	//@JsonMappingRecordInArrayOut({KeyPropertyName:'getKey'})
	//public collections : Record<string,InnerPiece> = {}

}

export class Container_Mapped_viaMethod {
	
	constructor(){}

	public init(){	
		for (let i = 0; i < 5; i++) {
			const c = new InnerPiece();
			this.collections[c.getKey()] = c;
		}
	}
  
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getKey',type:InnerPiece})
	public collections : Record<string,InnerPiece> = {}

 
}
 


function startTest( c, type : any = Container ){
	var json = JSONHandler.serialize(c);
	var deser= JSONHandler.deserialize(type,json); 
	return [c,json,deser];
}

function compareObject( obj1, obj2 , ignoreKeys : string[] = []){

	expect( Object.keys(obj1) ).toEqual( Object.keys(obj2) )

	let p1 = Object.getPrototypeOf(obj1 ).constructor.name;
	let p2 = Object.getPrototypeOf(obj2 ).constructor.name;
	expect(p1).toBe(p2);

	Object.keys(obj1).forEach( key  => {
		if(!ignoreKeys.includes(key)){
			let p1 = Object.getPrototypeOf(obj1[key])?.constructor?.name;
			let p2 = Object.getPrototypeOf(obj2[key])?.constructor?.name;
			if(typeof p1 == 'object'){
				compareObject(p1,p2,ignoreKeys)
			}else{
				expect(p1).toEqual(p2);
			}
		}
	});

	Object.keys(obj1).forEach( key  => {
		if(!ignoreKeys.includes(key)){
			let p1 = obj1[key];
			let p2 = obj2[key];
			if(typeof p1 == 'object'){
				compareObject(p1,p2,ignoreKeys)
			}else{
				expect(p1).toEqual(p2);
			} 
		}
	});

}
	 

test('Simple Conversions', () => {
	let c = new Container();
	// TRUE CHECKS 
	c.init();
	var [orig, json, des ] = startTest( c , Container);
	 
	var a = JSON.stringify(des);
	var b = JSON.stringify(orig);

	compareObject(des,orig,['key','KKey']);
})

test('Mapping Conversions With Method and Property Get Methods', () => {
	SomethingElse.reset();
	let c = new Container_Mapped_viaMethod;
	
	c.init(); 
	var [orig, json, des ] = startTest( c , Container_Mapped_viaMethod);
	
	const origColArr = Object.values(orig.collections);
	const desColArr = Object.values(des  .collections);
	for (let i = 0; i < desColArr.length; i++) {
		const a = desColArr[i]
		const b = origColArr[i]
		compareObject(a,b,['key','KKey']);
	}
	
	 
})
 

export class Container_Mapped_viaMethod_AllParameterTypes_1 {
	
	constructor(){}
	public init(){	
		for (let i = 0; i < 5; i++) {
			const c = new InnerPiece();
			this.collections1[c.getKey()] = c; 
		}
	}
  
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getKey',type:InnerPiece})
	public collections1 : Record<string,InnerPiece> = {}
}
export class Container_Mapped_viaMethod_AllParameterTypes_2 {
	
	constructor(){}
	public init(){	
		for (let i = 0; i < 5; i++) {
			const c = new InnerPiece();
			this.collections1[c.getKey()] = c; 
		}
	}
  
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getKKey',type:InnerPiece})
	public collections1 : Record<string,InnerPiece> = {}
}
export class Container_Mapped_viaMethod_AllParameterTypes_3 {
	
	constructor(){}
	public init(){	
		for (let i = 0; i < 5; i++) {
			const c = new InnerPiece();
			this.collections1[c.getKey()] = c; 
		}
	}
  
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getKK2ey',type:InnerPiece})
	public collections1 : Record<string,InnerPiece> = {}
}
export class Container_Mapped_viaMethod_AllParameterTypes_4 {
	
	constructor(){}
	public init(){	
		for (let i = 0; i < 5; i++) {
			const c = new InnerPiece();
			this.collections1[c.getKey()] = c; 
		}
	}
  
	@JsonMappingRecordInArrayOut({KeyPropertyName:'getKK3ey',type:InnerPiece})
	public collections1 : Record<string,InnerPiece> = {}
}
 
 
test('Mapping function with Params', () => {
	SomethingElse.reset();
	
	let hadException = false;
	// first is mapped to a correctly formatted function
	// with 0 params 
	try{
		let c = new Container_Mapped_viaMethod_AllParameterTypes_1;
		c.init(); 
		var [orig, json, des ] = startTest( c , Container_Mapped_viaMethod_AllParameterTypes_1);
	}catch(e){
		// it must not enter here, if it does fail
		hadException = true;
	}
	expect(hadException).toBe(false);

	// first is mapped to a wrongly formatted function
	// with a Necesary paramter
	hadException = false;
	try{
		let c = new Container_Mapped_viaMethod_AllParameterTypes_2;
		c.init(); 
		var [orig, json, des ] = startTest( c , Container_Mapped_viaMethod_AllParameterTypes_2);
	}catch(e){
		hadException = true;
	}
	expect(hadException).toBe(true);

	// first is mapped to a wrongly formatted function
	// with a Optional paramter
	hadException = false;
	try{
		let c = new Container_Mapped_viaMethod_AllParameterTypes_3;
		c.init(); 
		var [orig, json, des ] = startTest( c , Container_Mapped_viaMethod_AllParameterTypes_3);
		 
	}catch(e){
		// it must not enter here, if it does fail
		hadException = true;
	}
	expect(hadException).toBe(false);

	// first is mapped to a wrongly formatted function
	// with a paramter with default value
	hadException = false;
	try{
		let c = new Container_Mapped_viaMethod_AllParameterTypes_4;
		c.init(); 
		var [orig, json, des ] = startTest( c , Container_Mapped_viaMethod_AllParameterTypes_4);
		 
	}catch(e){
		// it must not enter here, if it does fail
		// since a default value makes it optional.
		hadException = true; 
	}
	expect(hadException).toBe(false);
 
	
})