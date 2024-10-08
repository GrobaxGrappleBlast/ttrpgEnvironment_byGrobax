import { JsonArrayString, JsonBoolean, JsonProperty, JsonString } from "grobax-json-handler"; 
import { FileHandler } from "../fileHandler";
import { keyManagerInstance } from "ttrpg-system-graph";
import PluginHandler from "../../../../src/Modules/ui-obsidian/app";
import { BASE_SCHEME } from "grobax-json-handler";
 
export class UILayoutModelSchemes{ 
	static BASE 	= BASE_SCHEME ;
	static PAGE 	='PAGE'; 
}
export class UILayoutModel {

	public id : string = keyManagerInstance.getNewKey();

	@JsonString({scheme:[UILayoutModelSchemes.BASE,UILayoutModelSchemes.PAGE]})
	guid	:string = PluginHandler.uuidv4();

	@JsonString({scheme:[UILayoutModelSchemes.BASE]})
	author	:string;
	
	@JsonString({scheme:[UILayoutModelSchemes.BASE]})
	version:string;

	@JsonString({scheme:[UILayoutModelSchemes.BASE,UILayoutModelSchemes.PAGE]})
	name	:string;
	
	@JsonString({scheme:[UILayoutModelSchemes.BASE]})
	mainStyle : string;
	
	@JsonString({scheme:[UILayoutModelSchemes.BASE]})
	componentJs	: string;

	@JsonString({scheme:[UILayoutModelSchemes.BASE]})
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
