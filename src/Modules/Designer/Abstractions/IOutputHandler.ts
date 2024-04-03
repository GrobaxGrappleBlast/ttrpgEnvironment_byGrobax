export interface IOutputHandler {
	outError(msg) 
	outLog(msg) 
}

export function newOutputHandler() : IOutputHandler { 
	let a : IOutputHandler = {
		outError: function (msg: any) {
			console.error(msg);
		},
		outLog: function (msg: any) {
			console.log(msg)
		}
	}
	return a;
}