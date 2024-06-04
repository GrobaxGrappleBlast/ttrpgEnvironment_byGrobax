import { JSONHandler, JsonMapping, JsonMappingRecordInArrayOut, JsonProperty } from '../index'


var SecretKeyGen = 0;

export class Piece{

	constructor( offset : string | null = null ){ 
		this.name = "name" + offset;
		this.value = 2 + Math.random();
		this.key = "k"+SecretKeyGen++;
	}

	@JsonProperty( { name:"InnerValue" } )
	public value: number;

	@JsonProperty( { name:"NameingConvention"} )
	public name: string; 


	@JsonProperty( { name:"KeyProperty"} )
	public key : string ;
	
	
}
export class House {
	
	constructor(){}

	public init( numfundamentbricks = 5){


		for (let i = 0; i < numfundamentbricks; i++) {
			let p = { name : 'tjek1' , number : 152 };
			this.collections_WithNameChange[ p.name ] = p;
			this.collections_WithoutNameChange[p.name] = p;
			this.collections_special[p.name] = p;
		}
		
		for (let i = 0; i < numfundamentbricks; i++) {
			let p = new Piece('f' + i );
			this.pieces[ p.name ] = p;
			this.pieces_withNameChange[p.name] = p;
			this.piecesSpecial[p.name] = p;
		}
	
	}

	// WITH CLASS CONSTRUCTORS 
	@JsonMappingRecordInArrayOut({KeyPropertyName:'name', type:Piece})
	public piecesSpecial : Record< string, Piece> = {}

	@JsonMapping( 
		{
			inFunction:( col: any[] , d ) => { 
				let r = {};
				col.map( p =>{  
					let o = d(p);
					r[o.name]=o
				});
				return r;
			},
			outFunction:( col , s ) => { return Object.values(col).map( p => s(p) ) },
			type: Piece 
		}
	)
	public pieces : Record< string, Piece> = {}

	@JsonProperty( 
		{ 
			name:"pieces_withNameChange_UBU",
			mappingFunctions:{ 
				out( col , s ){ return Object.values(col).map( p => s(p) ) },
				in( col: any[] , d ){ 
					let r = {};
					col.map( p =>{  
						let o = d(p); 
						r[o.name]=o
					});
					return r;
				}
			},
			type: Piece 
		}
	)
	public pieces_withNameChange : Record< string, Piece> = {}


	// WITH NO CLASS CONSTRUCTORS 
	@JsonProperty( 
		{ 
			name:"TestCollections",
			mappingFunctions:{ 
				out( col , s ){ 
					return Object.values(col).map( p => s(p) ) 
				},
				in(col: any[] , d ){ 
					let r = {};
					col.map( p =>{
						let key = p.name;
						let res = d(p)
						r[key] = res;
					})  
					return r;
				}
			}
		}
	)
	public collections_WithNameChange : Record< string, Object> = {}

	@JsonProperty( 
		{  
			mappingFunctions:{ 
				out( col , s ){ 
					return Object.values(col).map( p => s(p) ) 
				},
				in(col: any[] , d ){ 
					let r = {};
					col.map( p =>{ r[p.name] = d(p) })  
					return r;
				}
			}
		}
	)
	public collections_WithoutNameChange : Record< string, Object> = {}

	@JsonMappingRecordInArrayOut({KeyPropertyName:'name'})
	public collections_special : Record< string, Object> = {}
}

test('CheckForMappings.', () => {

	const adresse = "Gråvej 12, st. ";

	let h = new House();
	h.init(4);
	let json = JSONHandler.serialize(h);
	let obj = JSONHandler.deserialize(House,json);
	 
	// first we test the class Deserialization
	expect(Object.keys(obj.piecesSpecial).length).toBe(Object.keys(h.piecesSpecial).length);
	for( const key in obj.piecesSpecial ){  
		expect( obj.piecesSpecial[key].key	).toBe( h.piecesSpecial[key].key	);
		expect( obj.piecesSpecial[key].name	).toBe( h.piecesSpecial[key].name	);
		expect( obj.piecesSpecial[key].value).toBe( h.piecesSpecial[key].value	);
	}
  
	expect(Object.keys(obj.pieces).length).toBe(Object.keys(h.pieces).length);
	for( const key in obj.pieces ){  
		expect( obj.pieces[key].key		).toBe( h.pieces[key].key	);
		expect( obj.pieces[key].name	).toBe( h.pieces[key].name	);
		expect( obj.pieces[key].value	).toBe( h.pieces[key].value	);
	}
 
	expect(Object.keys(obj.pieces_withNameChange).length).toBe(Object.keys(h.pieces_withNameChange).length);
	for( const key in obj.pieces ){  
		expect( obj.pieces_withNameChange[key].key		).toBe( h.pieces_withNameChange[key].key	);
		expect( obj.pieces_withNameChange[key].name		).toBe( h.pieces_withNameChange[key].name	);
		expect( obj.pieces_withNameChange[key].value	).toBe( h.pieces_withNameChange[key].value	);
	}

	/*
	WE DISALLOW UNTYPED OBJECTS
	// then we test in the same way the NON class deserialization, instead of class its generic object
	expect(Object.keys(obj.collections_WithNameChange).length).toBe(Object.keys(h.collections_WithNameChange).length);
	for( const key in obj.collections_WithNameChange ){  
		expect( obj.collections_WithNameChange[key].number		).toBe( (h.collections_WithNameChange[key] as any).number	);
		expect( obj.collections_WithNameChange[key].name		).toBe( (h.collections_WithNameChange[key] as any).name	);
	}

	expect(Object.keys(obj.collections_WithoutNameChange).length).toBe(Object.keys(h.collections_WithoutNameChange).length);
	for( const key in obj.collections_WithoutNameChange ){  
		expect( obj.collections_WithoutNameChange[key].number		).toBe( (h.collections_WithoutNameChange[key] as any).number	);
		expect( obj.collections_WithoutNameChange[key].name		).toBe( (h.collections_WithoutNameChange[key] as any).name	);
	}

	expect(Object.keys(obj.collections_special).length).toBe(Object.keys(h.collections_special).length);
	for( const key in obj.collections_special ){  
		expect( obj.collections_special[key].number		).toBe( (h.collections_special[key] as any).number	);
		expect( obj.collections_special[key].name		).toBe( (h.collections_special[key] as any).name	);
	}
	*/
})

test('TYPED: automappings @JsonMappingRecordInArrayOut', () => {

	const adresse = "Gråvej 12, st. ";

	let h = new House();
	h.init(4);
	let json = JSONHandler.serialize(h);
	let obj = JSONHandler.deserialize(House,json);
	 
	// first we test the class Deserialization
	expect(Object.keys(obj.piecesSpecial).length).toBe(Object.keys(h.piecesSpecial).length);
	for( const key in obj.piecesSpecial ){  
		expect( obj.piecesSpecial[key].key	).toBe( h.piecesSpecial[key].key	);
		expect( obj.piecesSpecial[key].name	).toBe( h.piecesSpecial[key].name	);
		expect( obj.piecesSpecial[key].value).toBe( h.piecesSpecial[key].value	);
	}

})
/*
WE DISALLOW UNTYPED OBJECTS
test('UNTYPED: automappings @JsonMappingRecordInArrayOut', () => {

	const adresse = "Gråvej 12, st. ";

	let h = new House();
	h.init(4);
	let json = JSONHandler.serialize(h);
	let obj = JSONHandler.deserialize(House,json);

	expect(Object.keys(obj.collections_special).length).toBe(Object.keys(h.collections_special).length);
	for( const key in obj.collections_special ){  
		expect( obj.collections_special[key].number		).toBe( (h.collections_special[key] as any).number	);
		expect( obj.collections_special[key].name		).toBe( (h.collections_special[key] as any).name	);
	} 
})

*/



test('TYPED: Manual mappings using @JsonProperty', () => {

	const adresse = "Gråvej 12, st. ";

	let h = new House();
	h.init(4);
	let json = JSONHandler.serialize(h);
	let obj = JSONHandler.deserialize(House,json);
  
	expect(Object.keys(obj.pieces).length).toBe(Object.keys(h.pieces).length);
	for( const key in obj.pieces ){  
		expect( obj.pieces[key].key		).toBe( h.pieces[key].key	);
		expect( obj.pieces[key].name	).toBe( h.pieces[key].name	);
		expect( obj.pieces[key].value	).toBe( h.pieces[key].value	);
	}
 
})
/*
WE DISALLOW UNTYPED OBJECTS
test('UNTYPED: Manual mappings using @JsonProperty', () => {

	const adresse = "Gråvej 12, st. ";

	let h = new House();
	h.init(4);
	let json = JSONHandler.serialize(h);
	let obj = JSONHandler.deserialize(House,json);

	expect(Object.keys(obj.collections_WithoutNameChange).length).toBe(Object.keys(h.collections_WithoutNameChange).length);
	for( const key in obj.collections_WithoutNameChange ){  
		expect( obj.collections_WithoutNameChange[key].number		).toBe( (h.collections_WithoutNameChange[key] as any).number	);
		expect( obj.collections_WithoutNameChange[key].name		).toBe( (h.collections_WithoutNameChange[key] as any).name	);
	}
})
*/



test('TYPED: Manual mappings using @JsonProperty And Other OutNames', () => {

	const adresse = "Gråvej 12, st. ";

	let h = new House();
	h.init(4);
	let json = JSONHandler.serialize(h);
	let obj = JSONHandler.deserialize(House,json);
	 
	expect(Object.keys(obj.pieces_withNameChange).length).toBe(Object.keys(h.pieces_withNameChange).length);
	for( const key in obj.pieces ){  
		expect( obj.pieces_withNameChange[key].key		).toBe( h.pieces_withNameChange[key].key	);
		expect( obj.pieces_withNameChange[key].name		).toBe( h.pieces_withNameChange[key].name	);
		expect( obj.pieces_withNameChange[key].value	).toBe( h.pieces_withNameChange[key].value	);
	}

})

/*
WE DISALLOW UNTYPED OBJECTS
test('UNTYPED: Manual mappings using @JsonProperty And Other OutNames', () => {

	const adresse = "Gråvej 12, st. ";

	let h = new House();
	h.init(4);
	let json = JSONHandler.serialize(h);
	let obj = JSONHandler.deserialize(House,json);

	// then we test in the same way the NON class deserialization, instead of class its generic object
	expect(Object.keys(obj.collections_WithNameChange).length).toBe(Object.keys(h.collections_WithNameChange).length);
	for( const key in obj.collections_WithNameChange ){  
		expect( obj.collections_WithNameChange[key].number		).toBe( (h.collections_WithNameChange[key] as any).number	);
		expect( obj.collections_WithNameChange[key].name		).toBe( (h.collections_WithNameChange[key] as any).name	);
	}
})
*/