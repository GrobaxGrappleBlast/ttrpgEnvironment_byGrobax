
export class StringFunctions{

	public static isValidWindowsFileString( str : string ){

		if(!str)
			return false;

		// Regular expression to match invalid characters in a Windows file name
		const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F]/g;
		
		// Check if the string contains any invalid characters or reserved names
		return !invalidCharsRegex.test(str) && !/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(str) && str.length <= 255;
	}

	public static isValidSystemCodeName( str : string ){

		if(!str)
			return false;
		
		const regex = /[^a-zA-Z0-9]/;
		return !regex.test(str);
	}

	public static ConvertToValidWindowsFileString( str : string ){
		//var out = (str.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g, ""));
		//return out; 
		// Regular expression to match invalid characters in a Windows file name
		const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F]/g;

		// Replace invalid characters with an underscore
		const validStr = str.replace(invalidCharsRegex, "_");

		// Ensure the string is not longer than 255 characters
		return validStr.slice(0, 255);
	}

	public static  uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
		.replace(/[xy]/g, function (c) {
			const r = Math.random() * 16 | 0, 
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
 
	public static  uuidShort() {
		return 'xxxxxxxx'
		.replace(/[xy]/g, function (c) {
			const r = Math.random() * 16 | 0, 
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}


	private static recursiveFindNewName_LOOP<T>( testName : string , counter:number, array:T[] , getName : ( item:T ) => string ) : string{
		let i = array.findIndex( p => getName(p) == testName + counter );
		if (i == -1)
			return testName + counter ;
		return this.recursiveFindNewName_LOOP( testName , ++counter , array , getName );
	}


	public static recursiveFindNewName<T>( testName : string, array:T[] , getName : ( item:T ) => string ) : string{
		let i = array.findIndex( p => getName(p) == testName );
		if (i == -1)
			return testName  ;
		return this.recursiveFindNewName_LOOP( testName , 0 , array , getName );
	}


}