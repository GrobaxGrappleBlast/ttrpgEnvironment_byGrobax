import { IAPI } from "src/Modules/api/IAPI";
import { SystemPreview } from 				"../../../../../src/Modules/core/model/systemPreview";
import { TTRPGSystemJSONFormatting } from 	"../../../../../src/Modules/graphDesigner/index";
import { UISystem } from "../../../../../src/Modules/graphDesigner/UIComposition/UISystem";
import { Writable, writable } from "svelte/store";
import StaticMessageHandler from '../../Components/Messages/StaticMessageHandler.svelte';
import { SvelteComponent } from "svelte";
import { ComponentType } from "svelte";

export class Layout01Context{
	public activeFactory 	: TTRPGSystemJSONFormatting;
	public activeSystem		: SystemPreview;

	public availablePreviews:SystemPreview[];
	public API : IAPI;
	public mainAppContainer : HTMLElement;
	public messageHandler:StaticMessageHandler;

	public uiSystem : UISystem;
	public uiGuid : string;

	public flowinActive : Writable<boolean> = writable(false);
	public dynamicFlowInComponent : {component:any, props:any};
}