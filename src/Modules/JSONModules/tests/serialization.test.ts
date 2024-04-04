import { JSONHandler, JsonProperty, JsonTypedArrayProperty, JsonTypedMultiArrayProperty, JsonTypedProperty } from "../Decorators";


export class Brick{

	constructor(width = 2, isSmall = false , color : string = "#fff"  ){
		this.width = width;
		this.isSmall = isSmall;
		this.color = color;
	}

	@JsonProperty 
	public color	:string = "#fff";

	@JsonProperty 
	public isSmall	:boolean = false;

	@JsonProperty 
	public width	:number = 0; 
	
}

export class House {
	

	constructor( adresse, numfundamentbricks = 5, fundament2bricks = 5, wallBricks = 5){
		this.adresse = adresse;//"Gråvej 12, st. ";
		this.firstBrick = new Brick(5);

		for (let i = 0; i < numfundamentbricks; i++) {
			this.fundament.push( new Brick(i) );
		}

		for (let i = 0; i < fundament2bricks; i++) {
			this.fundament2.push( new Brick(i) );
		}

	}

	@JsonProperty 
	public adresse	:string = "";

	@JsonTypedProperty( Brick ) 
	public firstBrick :Brick ;

	@JsonTypedProperty( [Brick] ) 
	public fundament :Brick[] = [];

	@JsonTypedArrayProperty(Brick) 
	public fundament2 :Brick[] = [];
}

test('Create A basic model and serializeit.', () => {

	const adresse = "Gråvej 12, st. ";

	let h = new House(adresse,4,4,4);
	let json = JSONHandler.Serialize(h);
	let obj: House | null = null ;
	debugger;
	
	// We try to deserialize the object to validate that the json is valid
	let serializationSuccess = false
	try{
		obj = JSON.parse(json);
		serializationSuccess = true;
	}catch(e){}
	expect(serializationSuccess).toBe(true);


	if( !obj ){
		expect(false).toBe(true);	
		return;
	}
	
	expect(obj.adresse).toBe(adresse);
	expect(obj.firstBrick.width		).toBe(5);
	expect(obj.firstBrick.isSmall	).toBe(false);
	expect(obj.firstBrick.color		).toBe('#fff');

	expect(obj.fundament.length		).toBe(4);
	expect(obj.fundament2.length	).toBe(4);
	 
})