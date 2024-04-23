import "reflect-metadata"; 
import { newOutputHandler, type IOutputHandler } from "../Designer/Abstractions/IOutputHandler";

const NoOutput : IOutputHandler = {
	outError(msg) {},
	outLog(msg) {}
}

const BASE_SCHEME = '_base';
enum JSON_TAGS{
	JSON_PROPERTY				= "JSON_PROPERTY"				, 
	JSON_PROPERTY_TYPED 		= "JSON_PROPERTY_TYPED"			, 
	JSON_PROPERTY_NAME_MAP_IN	= "JSON_PROPERTY_NAME_MAP_IN"	,
	JSON_PROPERTY_NAME_MAP_OUT	= "JSON_PROPERTY_NAME_MAP_OUT"	,
	JSON_PROPERTY_FUNC_MAP_IN	= "JSON_PROPERTY_FUNC_MAP_IN"	,
	JSON_PROPERTY_FUNC_MAP_OUT	= "JSON_PROPERTY_FUNC_MAP_OUT" ,
	JSON_PROPERTY_FORCE_BASE_TYPE	= "JSON_PROPERTY_FORCE_BASE_TYPE" , 
	JSON_PROPERTY_FORCE_ARRAY 		= "JSON_PROPERTY_FORCE_ARRAY"	 , 
}
enum JSON_BASETYPES{
	string 	= 'string',
	bool 	= 'bool',
	number	= 'number'
}
type Constructor<T extends object> = new () => T;

function hasMetaDataInScheme(metaTag , target , propertyKey , scheme ){
	try{
		let data = Reflect.getMetadata( metaTag , target , propertyKey ); 
		if(data[scheme] != undefined)
			return true;
		return false;
	}catch(e){
		return false;
	}
}
function getMetadata(metaTag , target , propertyKey , scheme : string = BASE_SCHEME){
	let data = Reflect.getMetadata( metaTag , target , propertyKey ); 
	if(!data)
		return null;

	let r = data[scheme] ?? data[BASE_SCHEME] ;
	return r;
}
function setMetadata( metaTag , value , target , propertyKey , scheme : string = BASE_SCHEME){
	
	// get meta data if it exists 
	let data = Reflect.getMetadata( metaTag , target , propertyKey ); 
	if(!data)
		data = {}

	// set value to scheme;
	data[scheme] = value;
	
	// define the metaData;
	Reflect.defineMetadata( metaTag, data, target, propertyKey);
}

export interface JSONPropertyOptions {
	scheme?:string,
	name?: string ,
	isArray?:boolean
}
interface JSONInnerPropertyOptions<IN extends object,OUT extends object> extends JSONPropertyOptions{
	scheme?:string,
	mappingFunctions? :{ out:( t:IN , serialize?:any ) => OUT , in:( b:OUT, deserialize?:any ) => IN } , 
	type?: any,
	forceBaseType?: false | keyof typeof JSON_BASETYPES
}

export function JsonProperty( option?:JSONInnerPropertyOptions<any,any> ) { 
	return function (target: any, propertyKey: string ) {

		let scheme = option?.scheme ?? BASE_SCHEME;
		setMetadata( JSON_TAGS.JSON_PROPERTY , true		, target, propertyKey, scheme );
		if(!option){
			return;
		} 

		if(option.forceBaseType){
			switch(option.forceBaseType){
				case JSON_BASETYPES.string: 
				case JSON_BASETYPES.number:
				case JSON_BASETYPES.bool:	
					setMetadata( 	JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE	,	option.forceBaseType,	target,	propertyKey, scheme 	);
			}
		}

		if(option.isArray){
			setMetadata( JSON_TAGS.JSON_PROPERTY_FORCE_ARRAY, true	, target, propertyKey , scheme);
		}	

		if(option.name){
			setMetadata( JSON_TAGS.JSON_PROPERTY_NAME_MAP_IN, propertyKey	, target, option.name, scheme);
			setMetadata( JSON_TAGS.JSON_PROPERTY_NAME_MAP_OUT, option.name	, target, propertyKey , scheme);
		}	

		if(option.mappingFunctions){
			setMetadata( JSON_TAGS.JSON_PROPERTY_FUNC_MAP_IN, option.mappingFunctions.in	, target, propertyKey , scheme);
			setMetadata( JSON_TAGS.JSON_PROPERTY_FUNC_MAP_OUT, option.mappingFunctions.out	, target, propertyKey , scheme);
		}	
 
		if(option.type){
			setMetadata( JSON_TAGS.JSON_PROPERTY_TYPED		, option.type	, target, propertyKey , scheme);
		}
		
	};
} 
export function JsonArrayProperty	( option?:JSONPropertyOptions ){
	option = cleanNonAccesibleSettings(option); 
	( option as JSONInnerPropertyOptions<any,any>).isArray 		 = true;
	return JsonProperty(option);
}
function cleanNonAccesibleSettings( option?:JSONPropertyOptions ){
	if(!option)
		return {};

	option.scheme = option.scheme == '' ? BASE_SCHEME : option.scheme;
	option.scheme = option.scheme ?? BASE_SCHEME;

	(option as any).mappingFunctions	= null;
	(option as any).type 				= null;
	(option as any).isArray				= null;
	(option as any).forceBaseType		= null;
	return option;
}

export function JsonNumber	( option?:JSONPropertyOptions ){
	option = cleanNonAccesibleSettings(option);
	( option as JSONInnerPropertyOptions<any,any>).forceBaseType = JSON_BASETYPES.number
	return JsonProperty(option);
}
export function JsonString	( option?:JSONPropertyOptions ){
	option = cleanNonAccesibleSettings(option);
	( option as JSONInnerPropertyOptions<any,any>).forceBaseType = JSON_BASETYPES.string
	return JsonProperty(option);
}
export function JsonBoolean	( option?:JSONPropertyOptions ){
	option = cleanNonAccesibleSettings(option);
	( option as JSONInnerPropertyOptions<any,any>).forceBaseType = JSON_BASETYPES.bool
	return JsonProperty(option);
}
export function JsonClassTyped<T extends object>( type : Constructor<T> , option?:JSONPropertyOptions ){
	option = cleanNonAccesibleSettings(option);
	( option as JSONInnerPropertyOptions<any,any>).type 	= type;
	return JsonProperty(option);
}

export function JsonArrayNumber	( option?:JSONPropertyOptions ){
	option = cleanNonAccesibleSettings(option);
	( option as JSONInnerPropertyOptions<any,any>).forceBaseType = JSON_BASETYPES.number;
	( option as JSONInnerPropertyOptions<any,any>).isArray 		 = true;
	return JsonProperty(option);
}
export function JsonArrayString	( option?:JSONPropertyOptions ){
	option = cleanNonAccesibleSettings(option);
	( option as JSONInnerPropertyOptions<any,any>).forceBaseType = JSON_BASETYPES.string;
	( option as JSONInnerPropertyOptions<any,any>).isArray 		 = true;
	return JsonProperty(option);
}
export function JsonArrayBoolean	( option?:JSONPropertyOptions ){
	option = cleanNonAccesibleSettings(option);
	( option as JSONInnerPropertyOptions<any,any>).forceBaseType = JSON_BASETYPES.bool;
	( option as JSONInnerPropertyOptions<any,any>).isArray 		 = true;
	return JsonProperty(option);
}
export function JsonArrayClassTyped<T extends object>( type : Constructor<T> , option?:JSONPropertyOptions ){
	option = cleanNonAccesibleSettings(option);
	( option as JSONInnerPropertyOptions<any,any>).isArray 		= true;
	( option as JSONInnerPropertyOptions<any,any>).type			= type;
	return JsonProperty(option);
}
 
// Mappings
interface JsonMappingParameters<IN extends object,OUT extends object>{
	scheme?:string,
	inFunction:( b:OUT, deserialize?:any ) => IN,
	outFunction:( t:IN , serialize?:any ) => OUT ,
	type? : Constructor<IN>,
	option? : JSONInnerPropertyOptions<IN,OUT>
}
export function JsonMapping<IN extends object,OUT extends object>( params : JsonMappingParameters<IN,OUT> ){
	// clean the input.
	let option : JSONInnerPropertyOptions<IN,OUT> = cleanNonAccesibleSettings(params.option ?? ({} as JSONInnerPropertyOptions<IN,OUT>)) as JSONInnerPropertyOptions<IN,OUT>;
	
	// set the type
	if(params.type)
		option.type = params.type;
	
	// Set mapping functions 
	(option as JSONInnerPropertyOptions<IN,OUT>).mappingFunctions = {
		out:params.outFunction,
		in:params.inFunction
	}
	return JsonProperty(option);
}

interface specialRecordArrayMappingProperties<IN extends object,OUT extends object> extends JSONInnerPropertyOptions<IN,OUT>{
	scheme?:string,
	KeyPropertyName:string
}
export function JsonMappingRecordInArrayOut<IN extends object,OUT extends object>( option : specialRecordArrayMappingProperties<IN,OUT> ){
	// clean the input.
	let type = option.type;
	option = cleanNonAccesibleSettings(option ?? ({} as JSONInnerPropertyOptions<IN,OUT>)) as specialRecordArrayMappingProperties<IN,OUT>;
	let outfunc = ( col : IN , s ) => { return Object.values(col).map( p => s(p) ) as OUT };
	let infunc = ( col: OUT , d ) => { 
		let r = {};
		// @ts-ignore
		col.map( p =>{ 
			let o = d(p); 
			let v = o[option.KeyPropertyName]; 
			if(typeof v == 'function'){
				try{
					v = o[option.KeyPropertyName]();
				}catch(e){
					let messageAddon = v.length > 0 ? ', Note that message must have 0 Arguments, that arent either optional or have default values': ''; 
					let message = `Something went wrong with callign method '${option.KeyPropertyName}'${messageAddon}`
					console.log(e);
					throw new Error(message);
				}
			}
			r[v] = o;
		});
		return r as IN;
	} 

	if(type){
		option.type = type;
	}

	// Set mapping functions 
	option.mappingFunctions = {
		out:outfunc,
		in:infunc
	}

	return JsonProperty(option);
}






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

		// get propertynames and loop through 
		let propertyNames;
		propertyNames = Object.getOwnPropertyNames( obj );
		for (let i = 0; i < propertyNames.length; i++) {
			
			// get basic properties
			const key = propertyNames[i];
			let meta = Reflect.getMetadataKeys( obj , key );	
			
			// check if the scheme we are about to export have The Property in it
			if( meta.length != 0 && !hasMetaDataInScheme(JSON_TAGS.JSON_PROPERTY,obj,key,scheme)){
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
					out = inFunction(obj[inKey], (obj) => JSONHandler.deserializeRaw(constr, obj  , scheme ) );
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
		return result;
	}
}
