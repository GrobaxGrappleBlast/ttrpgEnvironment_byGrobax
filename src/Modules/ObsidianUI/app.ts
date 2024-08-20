import { App, ItemView, Modal, Platform, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf, parseYaml } from 'obsidian';
import  SvelteApp from './UIInterfaces/Designer01/app.svelte';
import { BlockRenderer } from './BlockRenderer';


const VIEW_TYPE = "svelte-view";    
interface MyPluginSettings {
	mySetting: string;
 
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class GrobaxTTRPGSystemHandler extends Plugin { 

	public static App : App; 
	public static ROOT		  	: string;	
	public static PLUGIN_ROOT	: string;
	public static SYSTEMS_FOLDER_NAME	: string;
	public static BUILTIN_UIS_FOLDER_NAME	: string;
	public static self			: GrobaxTTRPGSystemHandler;  
	settings: MyPluginSettings;  


	async onload() {

		await this.loadSettings(); 
		GrobaxTTRPGSystemHandler.self = this;
		GrobaxTTRPGSystemHandler.App  = this.app;  
		GrobaxTTRPGSystemHandler.ROOT = GrobaxTTRPGSystemHandler.App.vault.configDir; 
		GrobaxTTRPGSystemHandler.PLUGIN_ROOT = this.manifest.dir as string; 
		GrobaxTTRPGSystemHandler.SYSTEMS_FOLDER_NAME = "Systems"
		GrobaxTTRPGSystemHandler.BUILTIN_UIS_FOLDER_NAME = "subProjects/BlockUIDev";
		
		 
		// add Ribbon Icons, these are the icons in the left bar of the window
		this.addRibbonIcon('dice', 'Hanss\' Plugin', (evt: MouseEvent) => {
			new ModalMount(this.app, this ).open(); 
		});
		this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
		 
		// Addinf the tab in settings. 
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor("TTRPG-TEST", (source, el, ctx) => {

			const renderer = new BlockRenderer(source,el,ctx);
			renderer.render();
			console.log(renderer);

			/*
			let method = async () => {
				
				let data = await FileHandler.readFile('.obsidian/plugins/ttrpg-dnd-statblocks-grobax/settings/DnD Test/character2.bar.html');
				const pluginPath = AFile.getPath();
				const pathhelpter = pluginPath + 'DnD Test/';
		 
				//first we are going to fix the CSS path to files 
				let regex = /url\(['|"]([a-zA-Z\.:/ ]+)['|"]\)/g;
				data = data.replace( regex, (match, capture) => {
					// check if its an online line
					if(capture.startsWith('https:'))
						return match;

					const test = pathhelpter + capture;
					const path = app.vault.adapter.getResourcePath(test);
					
					return `url('${path}')`;
				});

				regex = /src=['|"]([a-zA-Z\.:/ ]+)['|"]/g;
				data = data.replace( regex, (match, capture) => {
					
					// check if its an online line
					if(capture.startsWith('https:'))
						return match;

					const path = app.vault.adapter.getResourcePath(pathhelpter + capture);
					return `src="${path}"`;
				});
				  
				
				const SkillContainer = el.createEl('div');
				const bar = Handlebars.compile(data);
				SkillContainer.innerHTML = bar( null );
			}

			method();
			*/
		});
		
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
	plugin: GrobaxTTRPGSystemHandler;
	
	constructor(app: App, plugin: GrobaxTTRPGSystemHandler) {
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
	plugin:  GrobaxTTRPGSystemHandler; 

	constructor(app: App , plugin: GrobaxTTRPGSystemHandler) {
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