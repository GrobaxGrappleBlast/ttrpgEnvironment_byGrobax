import { App, ItemView, Modal, Platform, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf, parseYaml } from 'obsidian';
import  SvelteApp from './app.svelte';
import { BlockRenderer } from './BlockRenderer/BlockRenderer';
 

const VIEW_TYPE = "svelte-view";    
interface MyPluginSettings {
	mySetting: string;
 
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class PluginHandler extends Plugin { 

	public static App : App; 
	public static ROOT		  	: string;	
	public static PLUGIN_ROOT	: string;
	public static SYSTEMS_FOLDER_NAME	: string;
	public static BUILTIN_UIS_FOLDER_NAME	: string;
	public static SYSTEM_UI_CONTAINER_FOLDER_NAME	: string;
	public static SYSTEM_UI_LAYOUTFILENAME	: string;
	public static SYSTEM_LAYOUT_BLOCKNAME :string;
	public static GLOBAL_SYSTEM_PASSER :string;

	public static self			: PluginHandler; 
	
	//@ts-ignore
	settings: MyPluginSettings;  

	public static uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
		.replace(/[xy]/g, function (c) {
			const r = Math.random() * 16 | 0, 
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	async onload() {

		await this.loadSettings(); 
		PluginHandler.self = this;
		PluginHandler.App  = this.app;  
		PluginHandler.ROOT = PluginHandler.App.vault.configDir; 
		PluginHandler.PLUGIN_ROOT = this.manifest.dir as string; 
		
		// FOLDERS 
		PluginHandler.SYSTEMS_FOLDER_NAME 				= "Systems"
		PluginHandler.BUILTIN_UIS_FOLDER_NAME 			= "subProjects/BlockUIDev";
		PluginHandler.SYSTEM_UI_CONTAINER_FOLDER_NAME 	= 'UILayouts';
		PluginHandler.SYSTEM_UI_LAYOUTFILENAME 			= "UIPreview.json"

		// Strings used for global variables 
		PluginHandler.GLOBAL_SYSTEM_PASSER				= 'GrobaxTTRPGGlobalVariable';
		

		PluginHandler.SYSTEM_LAYOUT_BLOCKNAME 			= "TTRPG";	
		 
		// add Ribbon Icons, these are the icons in the left bar of the window
		this.addRibbonIcon('dice', 'Hanss\' Plugin', (evt: MouseEvent) => {
			new ModalMount(this.app, this ).open(); 
		});
		this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
		 
		// Addinf the tab in settings. 
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor(PluginHandler.SYSTEM_LAYOUT_BLOCKNAME, (source, el, ctx) => {
			const renderer = new BlockRenderer(source,el,ctx);
			//renderer.render(); 
		});

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => {
				if (leaf) {
					window[PluginHandler.GLOBAL_SYSTEM_PASSER] = {};
				}
			})
		);
	  
		
	} 
	onLayoutReady(): void {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
			return;
		}
		this.app.workspace.getRightLeaf(false)?.setViewState({
			type: VIEW_TYPE,
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

}

class SampleSettingTab extends PluginSettingTab {
	plugin: PluginHandler;
	
	constructor(app: App, plugin: PluginHandler) {
		super(app, plugin);
		this.plugin = plugin;
	} 

	display(): void {
		const { containerEl } = this; 
		containerEl.empty();    
		new SvelteApp({
			target:this.containerEl,
			props:{
				//@ts-ignore
				plugin: this.plugin
			}
		});
	}

}
class ModalMount extends Modal {  
	plugin:  PluginHandler; 

	constructor(app: App , plugin: PluginHandler) {
		super(app);
		this.plugin = plugin; 
	} 

	onOpen() {
		new SvelteApp({
			target:this.contentEl,
			props:{
				//@ts-ignore
				plugin: this.plugin
			}
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}