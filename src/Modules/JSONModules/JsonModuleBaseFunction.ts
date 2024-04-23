import { BASE_SCHEME } from "./JsonModuleConstants";

export function hasMetaDataInScheme(metaTag , target , propertyKey , scheme ){
	try{
		let data = Reflect.getMetadata( metaTag , target , propertyKey ); 
		if(data[scheme] != undefined)
			return true;
		return false;
	}catch(e){
		return false;
	}
}
export function getMetadata(metaTag , target , propertyKey , scheme : string = BASE_SCHEME){
	let data = Reflect.getMetadata( metaTag , target , propertyKey ); 
	if(!data)
		return null;

	let r = data[scheme] ?? data[BASE_SCHEME] ;
	return r;
}
export function setMetadata( metaTag , value , target , propertyKey , scheme : string = BASE_SCHEME){
	
	// get meta data if it exists 
	let data = Reflect.getMetadata( metaTag , target , propertyKey ); 
	if(!data)
		data = {}

	// set value to scheme;
	data[scheme] = value;
	
	// define the metaData;
	Reflect.defineMetadata( metaTag, data, target, propertyKey);
}
