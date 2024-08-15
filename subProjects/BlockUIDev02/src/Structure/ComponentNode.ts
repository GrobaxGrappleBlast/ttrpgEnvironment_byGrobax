
export class KeyManager {
	private keyCounter = 0;	
	getNewKey(){
		let num = this.keyCounter++;
		return num.toString(16);
	}
}

var keyManager = new KeyManager();
export class CNode {
	public constructor( type:string, data:string ){
		this.id = keyManager.getNewKey();
		this.type = this.type;
		this.data = this.data;
	}
	id:string;
	type:string;
	data:string;
}

export class SheetRow{
	public constructor( data:any[] = [] ){
		this.id = keyManager.getNewKey();
		this.data = [];
		data.forEach( d  => {
			if ( d != null && d.data && d.type){
				this.data.push( new CNode( d.type ,d.data ))
			}
			else{
				this.data.push(null)
			}
		});
	}
	id : string; 
	data : (CNode|null)[] = [];
}

export class SheetData {

	public constructor( data: any[] ){
		this.id = keyManager.getNewKey();
		this.data = [];
		data.forEach( d  => {
			if (d.data)
			this.data.push( new SheetRow( d.data ))
		});
	}
	id : string;
	data : SheetRow[] = [];	

	public addRow(){
		this.data.push(new SheetRow())
	}
}