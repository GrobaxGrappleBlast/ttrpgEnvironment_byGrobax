<script lang="ts">
	import { JSONHandler } from './../../../JSONModules/JsonHandler.ts';
	import { UILayoutModel } from '../../../../../src/Modules/ObsidianUICore/model/UILayoutModel';
	import { onMount } from 'svelte';
	import { SystemPreview } from '../../../../../src/Modules/ObsidianUICore/model/systemPreview';
	import StaticMessageHandler from './../Designer01/BaseComponents/Messages/StaticMessageHandler.svelte';
    import { ObsidianUICoreAPI } from "../../../../../src/Modules/ObsidianUICore/API";
	import './BlockStarter.scss'
    import { TTRPGSystemJSONFormatting } from 'src/Modules/Designer/JsonModuleImplementation/TTRPGSystemJSONFormatting.js';
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
		let JSON JSONHandler.serialize(systemObj.fixed);
		//TODO SERIALIZE THIS USING ONLY FIXED VALUES.
	}
</script>
<div class="BlockStarter" >
	<StaticMessageHandler 
		bind:this={msgHandler}

	/>
	<p>
		{'Select a System to Use '}
	</p>
	<div class="SystemTable BlocksStarterInteractiveContainer SystemeSelectertable">
		<section class="SystemTableRow tableHeader" >
			<div >
				author
			</div>
			<div>
				systemName
			</div>
			<div>
				version
			</div>
			<div>
				isEditable
			</div>
		</section>
		{#each systems as system (system)}
			<section class="SystemTableRow selectableRow" on:keyup on:click={()=>{selectSystem(system)}} data-selected={selected_system == system}>
				<div>
					{system.author}
				</div>
				<div>
					{system.systemName}
				</div>
				<div>
					{system.version}
				</div>
				<div>
					{system.isEditable}
				</div>
			</section>
		{/each}
	</div>

	{#if layouts != null}
		<p>
			{'Select a Layout for you system to Use '}
		</p>
		<div class="SystemTable BlocksStarterInteractiveContainer SystemeSelectertable">
			<section class="SystemTableRow tableHeader" > 
				<div > author </div> 
				<div> LayoutName </div> 
				<div> version </div> 
				<div>  </div>
			</section>
			{#each layouts as  l}
				<section 
					class="SystemTableRow selectableRow" 
					data-valid={l.valid} 
					on:keyup on:click={ () => {selectLayout(l)}} 
					data-selected={ selectedLayout == l }
				>
					<div>
						{l.author}
					</div>
					<div>
						{l.name}
					</div>
					<div>
						{l.version}
					</div>
					<div>
						{#each l.errors as err}
							<div class="selectableRowErrorMessage" >{err}</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/if}

	{#if selectedLayout }
		<div>
			<button on:click={saveAndLoad}>Save , Write And Load</button>
		</div>
	{/if}

</div>
<style >
	
</style>