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
export function setMetadata( metaTag , value , target , propertyKey , schemes : string[] = [BASE_SCHEME]){
	
	// get meta data if it exists 
	let data = Reflect.getMetadata( metaTag , target , propertyKey ); 
	if(!data)
		data = {}

	for (let i = 0; i < schemes.length; i++) {
		const scheme = schemes[i];
		
		// set value to scheme;
		data[scheme] = value;
		
		// define the metaData;
		Reflect.defineMetadata( metaTag, data, target, propertyKey);
	}
}
export function getMetaDataKeys( target, propertyKey ){
	return Reflect.getMetadataKeys( target , propertyKey )
}


export function getOwnMetaData( metaTag , target , scheme : string = BASE_SCHEME  ){
	// first we need the right target -> target
	let targ = target['constructor'] != undefined ? target.constructor : target;

	let data = Reflect.getOwnMetadata( metaTag , targ );
	data = data ?? {};
	if(data[scheme] != undefined)
		return data[scheme];
	return null;
}
export function setOwnMetaData( metaTag , target , value , schemes : string[] = [BASE_SCHEME] ){

	// get meta data if it exists 
	let data = Reflect.getOwnMetadata( metaTag , target ); 
	if(!data)
		data = {}

	for (let i = 0; i < schemes.length; i++) {
		const scheme = schemes[i];
			// set value to scheme;
		data[scheme] = value;
		
		// define the metaData;
		Reflect.defineMetadata( metaTag , data, target );
	}
	
 
}
export function getOwnMetaDataKeys(target ){

	// first we need the right target -> target
	let targ = target['constructor'] != undefined ? target.constructor : target;

	let data = Reflect.getOwnMetadataKeys(targ);
	return data;
}

export function setPrototype( target , prototype ){
	return Reflect.setPrototypeOf(target, prototype )
}
