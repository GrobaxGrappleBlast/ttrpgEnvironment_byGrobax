import type { IOutputHandler } from "../Designer/Abstractions/IOutputHandler";
import { getMetadata, getOwnMetaData, getOwnMetaDataKeys, hasMetaDataInScheme } from "./JsonModuleBaseFunction";
import { BASE_SCHEME, JSON_BASETYPES, JSON_TAGS, NoOutput, type Constructor } from "./JsonModuleConstants";



export class JSONHandler{
 
	public static serialize(obj: any  , scheme : string = BASE_SCHEME ): string {
		return JSON.stringify(JSONHandler.serializeRaw(obj, scheme ));
	} 
	private static serializeRaw( obj:any  , scheme : string = BASE_SCHEME ): object{

		if(!obj){
			return obj;
		}

		// if this is a base type just return
		const type =  typeof obj;
		switch(type){
			case 'string':
			case 'boolean':
			case 'number':
				return obj;
				
		}
		
		// serializedObject is a new object, without non Jsonproperties
		let result = {};

		// EVENT BFORE SERIALIZATION
		let ObjectMeta  = getOwnMetaDataKeys(obj);  
		// if there is an After serialize function get it and run it. 
		if(ObjectMeta.includes(JSON_TAGS.JSON_OBJECT_ON_BEFORE_SERIALIZATION)){
			// get meta data function and run it on the resulting object
			let f = getOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_BEFORE_SERIALIZATION,obj,scheme);
			
			if(f)
				f(obj);
		}

		// get propertynames and loop through 
		let propertyNames;
		propertyNames = Object.getOwnPropertyNames( obj );
		for (let i = 0; i < propertyNames.length; i++) {
			
			// get basic properties
			const key = propertyNames[i];
			let meta = Reflect.getMetadataKeys( obj , key );	
			
			// check if the scheme we are about to export have The Property in it
			if( !hasMetaDataInScheme(JSON_TAGS.JSON_PROPERTY,obj,key,scheme) ){
				continue;
			}

			// create the name of the property, but if there is a mapped out name, get that instead
			let PropertyName = key;
			if ( meta.includes(JSON_TAGS.JSON_PROPERTY_NAME_MAP_OUT )){
				PropertyName = getMetadata( JSON_TAGS.JSON_PROPERTY_NAME_MAP_OUT , obj , key  , scheme ); 
			}

			// if there is a mapping function
			let out : any = null;
			if ( meta.includes(JSON_TAGS.JSON_PROPERTY_FUNC_MAP_OUT )){
				let outFunction = getMetadata( JSON_TAGS.JSON_PROPERTY_FUNC_MAP_OUT , obj , key  , scheme  ); 
				out = outFunction(obj[key], (o)=>JSONHandler.serializeRaw( o, scheme ) );
			} 
			else if( meta.includes(JSON_TAGS.JSON_PROPERTY_FORCE_ARRAY ) ){
				out = [];
				if(obj[key]){
					if(Array.isArray(obj[key])){
						for (let j = 0; j < obj[key].length; j++) {
							const e = JSONHandler.serializeRaw(obj[key][j] , scheme );
							out.push(e)
						}
					}else{
						out.push(
							JSONHandler.serializeRaw(obj[key] , scheme )
						)
					}
				}
			}
			else {
				 
				out = JSONHandler.serializeRaw(obj[key] , scheme );
				 
			}

			// HANDLE Force Typing
			if( meta.includes(JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE)){
				let typekey = getMetadata( JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE , obj , key  , scheme )
				
				let convFunc = (e) => JSONHandler.deserializeAndForceSimple(typekey, e);
				if ( meta.includes(JSON_TAGS.JSON_PROPERTY_FORCE_ARRAY  )) {
					let temp = out;
					let newout : any[] = [];
					for (let i = 0; i < temp.length; i++) {
						newout.push( convFunc(temp[i]) );
					}
					out = newout;
				}else{
					out = convFunc(out);
				}
			}

			result[PropertyName] = out;
		}

		return result;
	}

	public static deserialize<T extends object>( target: Constructor<T> , json:any  , scheme : string = BASE_SCHEME, writeOut? : IOutputHandler ){
		
		if(!writeOut){
			writeOut = NoOutput;
		}


		const type = typeof json;
		if(type == 'string'){
			json = JSON.parse(json);
		}

		switch(type){
			case 'boolean':
			case 'number':
				writeOut.outError( 'Cannot derserialize type of ' + type );
				return;
		}

		return this.deserializeRaw(target,json , scheme );
	} 

	private static deserializeAndForceSimple( typekey , obj ){

		let out : any = obj ;
		// HANDLE Force Typing
		//if( meta.includes(JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE)){
		//let typekey = Reflect.getMetadata( JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE , obj , key )
		
		let convFunc: (e:any) => any = (e) => e; 
		switch(typekey){
			case JSON_BASETYPES.bool:
				convFunc= (input) => Boolean(input);
			break;
			case JSON_BASETYPES.string:
				if(obj == null)
					return "";
				
				if(typeof obj == 'object'){
					return JSON.stringify(obj);
				}

				convFunc = (input) => String(input);
			break;
			case JSON_BASETYPES.number:
				
				if(obj == null){
					return 0;
				}
				if(typeof obj == 'object'){
					return 1;
				}

				convFunc = ( e ) => {
					const numberValue = Number(e);
					return isNaN(numberValue) ? 0 : numberValue;
				}
			break; 
		}

		out = convFunc(out);
		return out;				
	}
	private static deserializeRaw<T extends object>(target : Constructor<T>, obj : any  , scheme : string = BASE_SCHEME){
		
		if(!obj){
			return obj;
		}

		// serializedObject is a new object, without non Jsonproperties
		let result = new target();
		let prototype = target.prototype;

		// EVENT ON BEFORE DESERIALIZE
		// todo implement;
		



		// get propertynames and loop through 
		let propertyNames = Object.getOwnPropertyNames( obj );
		for (let i = 0; i < propertyNames.length; i++) {
			
			// get basic properties
			let key = propertyNames[i];
			let inKey = key;
			let meta = Reflect.getMetadataKeys( prototype , key );	
			let PropertyName = key;

			// if this is an Out key, convert it to an IN Key, so we can get the right meta data. 
			if ( meta.includes(JSON_TAGS.JSON_PROPERTY_NAME_MAP_IN ) ){
				// get out key from the in Key
				key = getMetadata( JSON_TAGS.JSON_PROPERTY_NAME_MAP_IN , prototype , key  , scheme ); 
				meta = Reflect.getMetadataKeys( prototype , key );
				PropertyName = key;
			} 
 
			// Get the constructor if there is any, Generics take priority
			let out : any = null; 
			let	constr	= getMetadata( JSON_TAGS.JSON_PROPERTY_TYPED			, prototype , key  , scheme )
			
			if ( meta.includes(JSON_TAGS.JSON_PROPERTY_FUNC_MAP_IN )) {
				let inFunction = getMetadata( JSON_TAGS.JSON_PROPERTY_FUNC_MAP_IN , prototype , key  , scheme ); 
				if (constr) {
					out = inFunction(obj[inKey], (obj) => {
						let res = JSONHandler.deserializeRaw(constr, obj  , scheme )
						return res;
					} );
				} 
				else {
					out = inFunction(obj[inKey], (obj) => obj );
				}
			}
			else if( meta.includes(JSON_TAGS.JSON_PROPERTY_FORCE_ARRAY ) ){

				// if it needs deserializing
				let convert = ( e ) => e;
				if(constr){
					convert = ( e ) => JSONHandler.deserializeRaw(constr, e , scheme );
				}else{
					// as stated above
				}

				// if it needs to be converted to a simple type. EVEN after deserializing
				let convert2 = (e,typekey) => convert(e);
				if(meta.includes( JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE )){
					convert2 = (e, typekey) => {
						return JSONHandler.deserializeAndForceSimple( typekey, e );
					}
				}else{
					// as stated above
				}
				
				out = [];
				const typekey = getMetadata( JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE , prototype , key  , scheme  )
				for (let j = 0; j < obj[inKey].length; j++) {
					let e = obj[inKey][j];
					let r = convert2(e,typekey);
					out.push( r )
				}
			}
			else {
				if (constr) {
					out = JSONHandler.deserializeRaw(constr, obj[inKey]  , scheme );
				} 
				else{
					out = obj[inKey];
				}
			}

			result[PropertyName] = out; 
		}
 
		// EVENT ON AFTER DESERIALIZE
		let ObjectMeta  = getOwnMetaDataKeys(result); 
 
		// if there is an After serialize function get it and run it. 
		if(ObjectMeta.includes(JSON_TAGS.JSON_OBJECT_ON_AFTER_DE_SERIALIZATION)){
			// get meta data function and run it on the resulting object
			let f = getOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_AFTER_DE_SERIALIZATION,result,scheme); 
			if(f)
				f(result);
		}

		return result;
	}
}
