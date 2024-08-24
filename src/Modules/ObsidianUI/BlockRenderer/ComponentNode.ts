import { keyManagerInstance } from "../../../../src/Modules/Designer/Abstractions/KeyManager";

 
 
export class CNode {
	public constructor( type:string = 'NONE', data:string = '{}' ){
		this.id = keyManagerInstance.getNewKey();
		this.type = type;
		this.data = JSON.parse(data);
	}
	id:string;
	type:string;
	data:any;
}

export class SheetColumn{
	public constructor( data:any[] = [] ){
		this.id = keyManagerInstance.getNewKey();
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
	public remItem( id ){

		let i = this.data.findIndex( p=> p?.id == id);
		if (i==-1){
			console.error('cant remove column, since id is not present in data');
			return;
		}

		this.data.splice(i,1);
	}
}

export class SheetRow{
	public constructor( data:any[] = [] ){
		this.id = keyManagerInstance.getNewKey();
		this.data = [];
		data.forEach( d  => {
			this.data.push( new SheetColumn(d.data) );
		});
	}
	id : string; 
	data : (SheetColumn|null)[] = [];
	public addColumn(){
		this.data.push(new SheetColumn())
	}
	public remColumn( id ){

		let i = this.data.findIndex( p=> p?.id == id);
		if (i==-1){
			console.error('cant remove column, since id is not present in data');
			return;
		}

		this.data.splice(i,1);
	}

}

export class SheetData {

	public constructor( data: any[] ){
		this.id = keyManagerInstance.getNewKey();
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
	public remRow( id ){

		let i = this.data.findIndex( p=> p.id == id);
		if (i==-1){
			console.error('cant remove Row, since id is not present in data');
			return;
		}

		this.data.splice(i,1);
	}
}