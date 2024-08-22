<script lang="ts">
	import { fly, slide } from 'svelte/transition';
	import { JSONHandler } from '../../../../../src/Modules/JSONModules/JsonHandler';
	import { UILayoutModel } from '../../../../../src/Modules/ObsidianUICore/model/UILayoutModel';
	import { onMount } from 'svelte';
	import { SystemPreview } from '../../../../../src/Modules/ObsidianUICore/model/systemPreview';
	import StaticMessageHandler from './../Designer01/BaseComponents/Messages/StaticMessageHandler.svelte';
    import { ObsidianUICoreAPI } from "../../../../../src/Modules/ObsidianUICore/API";
	import './BlockStarter.scss'
    import { TTRPGSystemJSONFormatting } from '../../../../../src/Modules/Designer/JsonModuleImplementation/TTRPGSystemJSONFormatting.js';
	import CustomSelect from '../../../../../src/Modules/ObsidianUI/UIInterfaces/Designer01/BaseComponents/CustomSelect/CustomSelect.svelte';
	export let WriteDown : (txt : string) => any;
	let api = ObsidianUICoreAPI.getInstance();
	let msgHandler : StaticMessageHandler;

	let systems: SystemPreview[] = [];
	let selected_system: SystemPreview|null = null ;

	let layouts : UILayoutModel[] | null = null ;
	let selectedLayout : UILayoutModel|null = null;
	async function LoadSystemOptions(){
		let resp = await api.systemDefinition.getAllSystems();
		if (resp.responseCode != 200){
			let k =Object.keys(resp.messages);
			for (let i = 0; i < k.length; i++) {
				const key = k[i];
				const msg = resp.messages[key];
				msgHandler.addMessage(key, msg);
			}
			return;
		}
		systems = resp.response ?? [];		
	}
	
	onMount(()=>{
		LoadSystemOptions();
	})
	
	
	function onChangeSelectSystem( event ){
		const targ = event.target;
		if(targ.value == '-1'){
			selected_system = null;
			selectedLayout=null;
			layouts=null;
			return;
		}

		const sys = systems.find(p=>p.id == targ.value);
		if(sys)
			selectSystem(sys);
	}
	function selectSystem( system ){
		selectedLayout = null;
		layouts=null;
		if ( selected_system == system){
			selected_system = null;
			return;
		}else{
			selected_system = system;
			LoadSystemUIOptions();
		}
		
	}
	async function LoadSystemUIOptions(){
		if(!selected_system){
			return;
		}
		let resp = await api.UIImportExport.getAllAvailableUIsForSystem( selected_system );
		if(resp.responseCode != 200){
			const keys = Object.keys(resp.messages);
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				const msg = resp.messages[key];
				msgHandler.addMessageManual(key,msg.msg,msg.type);
			}
		}else{
			layouts = resp.response ?? [];
		}
	}


	function onChangeSelectLayout( event ){
		const targ = event.target;
		if(targ.value == '-1'){ 
			selectedLayout=null;
			layouts=null;
			return;
		}

		if(!layouts)
			return;
		

		const lay = layouts.find(p=>p.id == targ.value);
		if(lay)
			selectLayout(lay);
	}
	function selectLayout( layout ){
		if ( selectedLayout == layout){
			selectedLayout = null;
			return;
		}
		selectedLayout = layout;
	}
	async function saveAndLoad(){
		
		
		if (!(selected_system && selectLayout)){
			return;
		}
		
		// System Loading
		let S = await api.systemFactory.getOrCreateSystemFactory(selected_system);
		if (S.responseCode != 200){
			const keys = Object.keys( S.messages);
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				const msg = S.messages[key];
				msgHandler.addMessageManual(key,msg.msg,msg.type);
			}
			return 
		}
		
		let systemObj = S.response as TTRPGSystemJSONFormatting;
		let JSON = JSONHandler.serialize(systemObj.fixed);
		//TODO SERIALIZE THIS USING ONLY FIXED VALUES.
	}
</script>
<div class="BlockStarter" >
	<StaticMessageHandler 
		bind:this={msgHandler}

	/>
	<div style="height:20px">

	</div>
	<div class="SystemSelectStage ">
		<section>
			<b>Select Presets To Use</b>
			<p>
				To Use this Addon, you must choose a system to use, and a UI for that system to use.
				first select your system, and then select your layout 
			</p>
		</section>
		<div class="BlocksStarterInteractiveContainer SystemTable" transition:slide >
			<div class="SystemTableRow SelectRow" >
				<div style="width:100px;" >
					Chosen System
				</div>
				<div>
					<select on:change={ onChangeSelectSystem }>
						<option value="-1"> Select a System </option>
						{#each systems as sys }
							<option value={sys.id} >{ sys.systemName }</option>
						{/each}
					</select>
				</div>
				<div>
					Author: { selected_system?.author ?? '-'}
				</div>
				<div>
					version: { selected_system?.version ?? '-'}
				</div>
			</div>
			<div class="SystemTableRow SelectRow" >
				<div style="width:100px;" >
					Chosen Layout
				</div>
				<div>
					{#if selected_system && layouts }
						<select transition:slide  on:change={ onChangeSelectLayout }>
							<option value="-1"> Select a Layout </option>
								{#each layouts as lay }
									<option value={lay.id} >{ lay.name }</option>
								{/each}
						</select>
					{/if}
				</div>
				<div>
					Author: { selectedLayout?.author  ?? '-'}
				</div>
				<div>
					version: { selectedLayout?.version ?? '-'}
				</div>
			</div>
		</div>	
		<div style="height:10px;" ></div>
		{#if selectedLayout }
			<div transition:slide>
				<button
				class="ColoredInteractive" data-color="green"
				on:click={saveAndLoad}>Save , Write And Load</button>
			</div>
		{/if}
		<div style="height:20px;" ></div>
	</div>
	

</div>
<style >
	
</style>