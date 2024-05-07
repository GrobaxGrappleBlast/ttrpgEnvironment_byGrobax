import { StringFunctions } from './stringfunctions';
 

test('Test invalid fileNames', () => {

	 let invalids = [
		'/*HANEsddaas2',
		'IKIK""<<<:',
		'\nasdadsasd',
		'HarduTømpr??'
	 ]

	 
	 let valids = [
		'ÅbenkasseDirkning',
		'Tjeb in i ditte',
		"67890",
		"ra#asdsd"
	 ]


	expect(StringFunctions.isValidWindowsFileString(invalids[0])).toBe(false);
	expect(StringFunctions.isValidWindowsFileString(invalids[1])).toBe(false);
	expect(StringFunctions.isValidWindowsFileString(invalids[2])).toBe(false);
	expect(StringFunctions.isValidWindowsFileString(invalids[3])).toBe(false);
	
	expect(StringFunctions.isValidWindowsFileString(valids[0])).toBe(true);
	expect(StringFunctions.isValidWindowsFileString(valids[1])).toBe(true);
	expect(StringFunctions.isValidWindowsFileString(valids[2])).toBe(true);
	expect(StringFunctions.isValidWindowsFileString(valids[3])).toBe(true);
	 
	expect(StringFunctions.ConvertToValidWindowsFileString(invalids[0])).toBe('__HANEsddaas2');
	expect(StringFunctions.ConvertToValidWindowsFileString(invalids[1])).toBe('IKIK______');
	expect(StringFunctions.ConvertToValidWindowsFileString(invalids[2])).toBe('_asdadsasd');
	expect(StringFunctions.ConvertToValidWindowsFileString(invalids[3])).toBe('HarduTømpr__');
	
});