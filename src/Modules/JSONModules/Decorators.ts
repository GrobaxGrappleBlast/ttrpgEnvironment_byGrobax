import "reflect-metadata"; 
import { newOutputHandler, type IOutputHandler } from "../Designer/Abstractions/IOutputHandler";
import type { Constructor } from "obsidian";
import { BASE_SCHEME, JSON_BASETYPES, JSON_TAGS } from "./JsonModuleConstants";
import { setMetadata } from "./JsonModuleBaseFunction";

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
		in:params.inFunction, 
	}
	return JsonProperty(option);
}

interface specialRecordArrayMappingProperties<IN extends object,OUT extends object> extends JSONInnerPropertyOptions<IN,OUT>{
	scheme?:string,
	KeyPropertyName:string,
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
		in:infunc, 
	}

	return JsonProperty(option);
}



