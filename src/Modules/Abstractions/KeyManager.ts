
export class KeyManager {
	private keyCounter = 0;	
	getNewKey(){
		let num = this.keyCounter++;
		return num.toString(16);
	}
}