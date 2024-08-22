import { JsonArrayString, JsonBoolean, JsonProperty, JsonString } from "../../../../src/Modules/JSONModules";
import { FileHandler } from "../fileHandler";
import { keyManagerInstance } from "../../../../src/Modules/Designer/Abstractions/KeyManager";
 

export class UILayoutModel {

	public id : string = keyManagerInstance.getNewKey();

	@JsonString()
	guid	:string;

	@JsonString()
	author	:string;
	
	@JsonString()
	version:string;

	@JsonString()
	name	:string;
	
	@JsonString()
	mainStyle : string;
	
	@JsonString()
	componentJs	: string;

	@JsonString()
	folderSrc:String;
	valid : boolean = true;
	errors : string[] = [];
	
	public async isValid(  ){
		let errors : string [] =[];
		
		if (!this.folderSrc){
			errors.push(`UILayoutModel for ${this.name} by ${this.author}, did not have a folderSrc`);
			return;
		}

		let valid = true;

		// see if the Javascript exists
		let src = this.folderSrc +'/'+this.componentJs;
		let _ = await FileHandler.exists( src );
		if ( !_ ){
			errors.push(`UILayoutModel for ${this.name} by ${this.author}, Pointed to a missing file ${src}`);
			valid = false;
		}

		// see if the css exists 
		src = this.folderSrc +'/'+this.mainStyle;
		_ = await FileHandler.exists( src );
		if ( !_ ){
			errors.push(`UILayoutModel for ${this.name} by ${this.author}, Pointed to a missing file ${src}`);
			valid = false;
		}

		this.valid = valid;
		return valid;
	}

	public async loadfile(file , errors : string [] = [] ){
		const src = this.folderSrc +'/'+file;
		let _ = await FileHandler.exists( src );
		if ( !_ ){
			errors.push(`file at ${src} did not exists`);
			return null;
		}

		let f = await FileHandler.readFile(src);
		return f;
	}
}
