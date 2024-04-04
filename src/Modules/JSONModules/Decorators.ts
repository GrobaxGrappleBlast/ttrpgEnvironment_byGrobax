
import "reflect-metadata";  
import { TTRPGSystemGraphModel } from "../Designer/GraphV2/TTRPGSystemGraphModel";


enum JSON_TAGS{
	JSON_PROPERTY_IS_MULTI_ARRAY 	= 'JsonIsMultiArray'	,
	JSON_PROPERTY_IS_ARRAY 	= 'JsonIsArray'	,
	JSON_PROPERTY_TYPED		= 'JsonTypedProperty' ,
	JSON_PROPERTY 			= 'JsonProperty' 
}

/**
 * Jsons typed array property
 * use like so 
 * @JsonProperty 
 * public color	:string;
 * Notice large first letters in the type.
 */
export function JsonProperty( target: any , propertyKey: string ) { 
	Reflect.defineMetadata(	JSON_TAGS.JSON_PROPERTY 	, true, target, propertyKey);
} 

/**
 * Jsons typed property
 * @JsonTypedArrayProperty(String) 
 * @JsonTypedArrayProperty(Boolean) 
 * @JsonTypedArrayProperty(Number)
 * @JsonTypedArrayProperty(CustomClass)
 * 
 * can also be used for arrays like so
 * @JsonTypedProperty( [Brick] ) - but ought to use the array method
 */
export function JsonTypedProperty( type: any ) {
	return function (target: any, propertyKey: string) {
		 
		// if this is an array we add a typed Array;
		const isArray = Array.isArray(type);
		const element = isArray ? (type as Function[])[0] : type;
		
		//console.log('Json Typed Property - ');
		//console.log(element);
		//console.log(target.constructor);

		if(isArray){
			Reflect.defineMetadata( JSON_TAGS.JSON_PROPERTY				, true		, target, propertyKey);
			Reflect.defineMetadata( JSON_TAGS.JSON_PROPERTY_TYPED		, element	, target, propertyKey);
			Reflect.defineMetadata( JSON_TAGS.JSON_PROPERTY_IS_ARRAY	, true		, target, propertyKey);
		}else{
			Reflect.defineMetadata( JSON_TAGS.JSON_PROPERTY				, true		, target, propertyKey);
			Reflect.defineMetadata( JSON_TAGS.JSON_PROPERTY_TYPED		, element	, target, propertyKey);
		}
	};
}


/**
 * Jsons typed array property
 * use like so 
 * @JsonTypedArrayProperty(String) 
 * @JsonTypedArrayProperty(Boolean) 
 * @JsonTypedArrayProperty(Number)
 * @JsonTypedArrayProperty(CustomClass)
 Notiec large first letters in the type.
 
 */
export function JsonTypedArrayProperty( type: any ) {
	return function (target: any, propertyKey: string) {
		 
		// if this is an array we add a typed Array;
		Reflect.defineMetadata( JSON_TAGS.JSON_PROPERTY				, true		, target, propertyKey);
		Reflect.defineMetadata( JSON_TAGS.JSON_PROPERTY_TYPED		, type		, target, propertyKey);
		Reflect.defineMetadata( JSON_TAGS.JSON_PROPERTY_IS_ARRAY	, true		, target, propertyKey);
		
	};
}

export function JsonTypedRecordProperty( typeKey: any, typeValue:any ) {
	return function (target: any, propertyKey: string) {
		 
		// if this is an array we add a typed Array;
		Reflect.defineMetadata( JSON_TAGS.JSON_PROPERTY				, true		, target, propertyKey);
		Reflect.defineMetadata( JSON_TAGS.JSON_PROPERTY_TYPED		, type		, target, propertyKey);
		Reflect.defineMetadata( JSON_TAGS.JSON_PROPERTY_IS_ARRAY	, true		, target, propertyKey);
		
	};
}





type Constructor<T extends object> = new (...args: any[]) => T;

export class JSONHandler{
 
	 

	public static Serialize(obj: any): string {

		if(typeof obj === 'string' )
			return obj;

		function serializeType( item : any ){
 
			const type =  typeof item;
			if( type === 'string')
				return `"${item}"`;

			
			if( type == 'boolean' || type == 'number')
				return `${item}`;

			let propertyNames = Object.getOwnPropertyNames( item );
		
			let jpiece = "{";
			let c = 0;
			for (let i = 0; i < propertyNames.length; i++) {
 
				// Getting Variables 
				const key  = propertyNames[i]; 
				let meta = Reflect.getMetadataKeys( item , key );	

				//HACK : getMetaDataKeys i tests giver et object ikke et array som dokumenteret
				if(typeof meta == 'object'){
					meta = Object.values(meta);
				}
 
				// if it doesnot have such a property. 
				if( !meta.includes( JSON_TAGS.JSON_PROPERTY) )
					continue;
				 
				if(c !== 0)
					jpiece += ',';
				let curr = `"${key}":`; 
				c++;

				
				// if this is not an array, deserialize and be done.  
				if( meta.includes( JSON_TAGS.JSON_PROPERTY_IS_ARRAY ) ){
					curr += "[";

					for (let j = 0; j < item[key].length; j++) {
						
						if(j != 0)
							curr += ',';

						curr += serializeType( item[key][j] );
					}
					curr += "]";
				}	 
				else { 
					curr += serializeType( item[key] );
				}
				jpiece += curr;	
			}
			jpiece += "}";
			return jpiece;
		};

		const res =serializeType(obj);
		return res;
	}

	public static SerializeAsRawCode(obj: any): string {

		if(typeof obj === 'string' )
			return obj;

		function serializeType( item : any , isBaseLevel  , levelIndent : string ){
			
			if( item == null )
				return `null`;

			if( typeof item === 'string')
				return `"${item}"`;

			if( typeof item == 'boolean' || typeof item == 'number')
				return `${item}`;



			let propertyNames = Object.getOwnPropertyNames( item );
		
			let jpiece = "{";
			let c = 0;
			const nextIndent = levelIndent + '\t';
			for (let i = 0; i < propertyNames.length; i++) {
 
				// Getting Variables 
				const key  = propertyNames[i];  

				
				let curr = `\n${nextIndent}${key} ${isBaseLevel ? '=' : ':' } `;  

				// if this is not an array, deserialize and be done.  
				if( Array.isArray(item[key]) ){
					curr += "[";

					 
					for (let j = 0; j < item[key].length; j++) {
						
						if(j != 0)
							curr += ',\n';
						else{
							curr += '\n';
						}
						// it adds a 0 on this line <- chat gpt see here 
						curr += `${nextIndent}\t`+ serializeType( item[key][j] , false,nextIndent );
					}
					curr += `${  item[key].length != 0 ? `\n${nextIndent}`:''}]`;

				}	 
				else { 
					curr += serializeType( item[key] ,false , nextIndent );
				}

			
				jpiece += curr + `${isBaseLevel ? '' : ',' }`;	
			}

			jpiece += `${ propertyNames.length != 0 ? `\n${levelIndent}` : ''}}`;
			return jpiece;
		};

		const res =serializeType(obj , true ,'');
		return res;
	}

	public static Deserialize<T extends object>( target: Constructor<T> , json:any){
			
		if(typeof json == 'string')
			json = JSON.parse(json);
 
		let currentPrototype = target.prototype.constructor
		 
		function jsonUndefined( constructor , key ){

		}
		function deserializeType<T extends object>( constructor:Constructor<T> , json:any ) : T{

			let item = new constructor();
			let propertyNames = Object.getOwnPropertyNames( item );
		

			for (let i = 0; i < propertyNames.length; i++) {
			
				// Getting Variables 
				const key  = propertyNames[i]; 
				const meta = Reflect.getMetadataKeys( item , key );	

				// if it doesnot have such a property. 
				if( ! meta.includes( JSON_TAGS.JSON_PROPERTY) )
					continue;

				// well if it isent typed... just deserialize it as if nothing matters
				if( !meta.includes( JSON_TAGS.JSON_PROPERTY_TYPED) ){

					// if this is required, and not supplied then we cannot deserialize it.
					if(json[key] == undefined){
						jsonUndefined(item,key) ;
						continue;
					}

					item[key] = json[key];
					continue;
				}

				const propType = Reflect.getMetadata( JSON_TAGS.JSON_PROPERTY_TYPED , item , key ); 

				// if this is not an array, deserialize and be done. 
				if( !meta.includes( JSON_TAGS.JSON_PROPERTY_IS_ARRAY ) ){

					// if this is required, and not supplied then we cannot deserialize it.
					if(json[key] == undefined){
						jsonUndefined(item,key) ;
						continue;
					}
					 
					let child = deserializeType( propType , json[key])
					item[key] = child;
				}	


				else { 

					// if this is required, and not supplied then we cannot deserialize it.
					if(json[key] == undefined){
						jsonUndefined(item,key);
						continue;
					}
						
					// create the and for each json child deserialize it.
					let arr : any[] = [];
					for (let j = 0; j < json[key].length; j++) {
						const jpiece = json[key][j];
						const child = deserializeType( propType, jpiece);
						arr.push(child);
					}
					item[key] = arr;
				}	
			}

			return item as T;

		};
		return deserializeType( currentPrototype,json ) as T;
	}
	
}
