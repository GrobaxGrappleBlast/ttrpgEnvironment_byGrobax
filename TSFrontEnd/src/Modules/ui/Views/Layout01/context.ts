import { IAPI } from "src/Modules/api/IAPI";
import { SystemPreview } from 				"../../../../../src/Modules/core/model/systemPreview";
import { TTRPGSystemJSONFormatting } from 	"../../../../../src/Modules/graphDesigner/index";
import { UISystem } from "../../../../../src/Modules/graphDesigner/UIComposition/UISystem";

export class Layout01Context{
	public activeSystem 	: TTRPGSystemJSONFormatting;
	public availablePreviews:SystemPreview[];
	public API : IAPI;
	public mainAppContainer : HTMLElement;

	public uiSystem : UISystem;
	public uiGuid : string;
}