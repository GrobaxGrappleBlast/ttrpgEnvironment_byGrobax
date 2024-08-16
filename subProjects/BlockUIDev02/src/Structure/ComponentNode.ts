
export class KeyManager {
	private keyCounter = 0;	
	getNewKey(){
		let num = this.keyCounter++;
		return num.toString(16);
	}
}

export var keyManager = new KeyManager();
export class CNode {
	public constructor( type:string = 'NONE', data:string = '{}' ){
		this.id = keyManager.getNewKey();
		this.type = type;
		this.data = JSON.parse(data);
	}
	id:string;
	type:string;
	data:any;
}

export class SheetColumn{
	public constructor( data:any[] = [] ){
		this.id = keyManager.getNewKey();
		this.data = [];
		data.forEach( d  => {
			if ( d != null && d.data && d.type){
				this.data.push( new CNode( d.type ,d.data ))
			}
			else{
				this.data.push(new CNode( ))
			}
		});
	}
	id : string; 
	data : (CNode|null)[] = [];
	public addItem(){
		this.data.push(new CNode())
	}

}

export class SheetRow{
	public constructor( data:any[] = [] ){
		this.id = keyManager.getNewKey();
		this.data = [];
		data.forEach( d  => {
			this.data.push( new SheetColumn(d.data) );
		});
	}
	id : string; 
	data : (SheetColumn|null)[] = [];
	public addItem(){
		this.data.push(new SheetColumn())
	}

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