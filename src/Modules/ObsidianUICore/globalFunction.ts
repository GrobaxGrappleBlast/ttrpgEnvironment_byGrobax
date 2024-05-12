

function recursiveFindNewName_LOOP<T>( testName : string , counter:number, array:T[] , getName : ( item:T ) => string ){
	let i = array.findIndex( p => getName(p) == testName + counter );
	if (i == -1)
		return testName + counter ;
	return recursiveFindNewName_LOOP( testName , ++counter , array , getName );
}


export function recursiveFindNewName<T>( testName : string, array:T[] , getName : ( item:T ) => string ){
	let i = array.findIndex( p => getName(p) == testName );
	if (i == -1)
		return testName  ;
	return recursiveFindNewName_LOOP( testName , 0 , array , getName );
}

