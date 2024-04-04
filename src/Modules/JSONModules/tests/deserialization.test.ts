import exp from "constants";
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
	let obj = JSONHandler.Deserialize(House,json);

	expect( obj.constructor.name ).toBe('House');
	expect( obj.fundament[0].constructor.name  ).toBe('Brick'); 
	expect( obj.fundament2[0].constructor.name  ).toBe('Brick');
 
})