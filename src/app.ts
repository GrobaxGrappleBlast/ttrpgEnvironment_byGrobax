import { App, ItemView, Modal, Platform, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf, parseYaml } from 'obsidian';
 
const VIEW_TYPE = "svelte-view";    
interface MyPluginSettings {
	mySetting: string;
 
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class GrobaxTTRPGSystemHandler extends Plugin { 

	public static App : App;
	public static PATH_PLUGIN_SETTINGS_FOLDER 	: string;
	public static ROOT		  					: string;	
	public static PATH_PLUGIN_FOLDER			: string;
	public static self							: GrobaxTTRPGSystemHandler;  
	settings: MyPluginSettings;  


	async onload() {

		await this.loadSettings();
		GrobaxTTRPGSystemHandler.self = this;
		GrobaxTTRPGSystemHandler.App  = this.app;  
		GrobaxTTRPGSystemHandler.ROOT = GrobaxTTRPGSystemHandler.App.vault.configDir; 
		GrobaxTTRPGSystemHandler.PATH_PLUGIN_FOLDER = "plugins"
		GrobaxTTRPGSystemHandler.PATH_PLUGIN_SETTINGS_FOLDER = "settings"

		// add Ribbon Icons, these are the icons in the left bar of the window
		this.addRibbonIcon('dice', 'Hanss\' Plugin', (evt: MouseEvent) => {
			new ModalMount(this.app, this ).open(); 
		});
		this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
		 
		// Addinf the tab in settings. 
		this.addSettingTab(new SampleSettingTab(this.app, this));
		
	} 
	onLayoutReady(): void {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
			return;
		}
		this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE,
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

}

class SampleSettingTab extends PluginSettingTab {
	plugin: GrobaxTTRPGSystemHandler;
	
	constructor(app: App, plugin: GrobaxTTRPGSystemHandler) {
		super(app, plugin);
		this.plugin = plugin;
	} 

	display(): void {
		const { containerEl } = this; 
		containerEl.empty();    
	}

}
class ModalMount extends Modal {  
	plugin:  GrobaxTTRPGSystemHandler; 

	constructor(app: App , plugin: GrobaxTTRPGSystemHandler) {
		super(app);
		this.plugin = plugin; 
	} 

	onOpen() {}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}