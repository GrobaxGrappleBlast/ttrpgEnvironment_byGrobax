<script lang="ts">
    import { slide } from "svelte/transition";
	import EditAbleList from "../../../../../../Components/editAbleList/EditAbleList.svelte";
    import SubSystemImporter from "./SubSystemImporter.svelte";
    import { Layout01Context } from "../../../../context";
    import { onMount } from "svelte";
    import { UITemplate } from "../../../../../../../core/model/UITemplate";
	import SystemUITemplateViewer from './SystemUITemplateViewer.svelte';
	import { SystemExporterMethods } from "./SystemExporterMethods";
    import Menu from "../../../Menu/Menu.svelte";
    import SystemUiTemplateViewer from "./SystemUITemplateViewer.svelte";

	export let context :Layout01Context;
	class subpages {
		public static importer = 'importer';
		public static exporter = 'exporter';
	}

	let UITemplateList : EditAbleList ;
	let subpage : string = '';
	let availableUITemplates : UITemplate[] = [];
	let activeUITemplate: UITemplate | null = null; 
	let activeUITemplateVersions : string[] ;
	let activeUITemplateVersions_selected : string ;

	let newUIName :string;

 
	onMount(async()=>{
		const resp = (await context.API.getSystemUIs(context.activeSystem));
		availableUITemplates = resp.response;
	})
	
	async function selectUITemplate( e : string | null ){
 
		// if it is a raw deselect. deselct and return
		if (e == null){
			activeUITemplate = null;
			return;
		}

		//context.flowinActive.set(true);
		activeUITemplate = availableUITemplates.find( p => p.name == e ) ?? null;

		if (activeUITemplate == null){
			return;
		}

		activeUITemplateVersions = (await context.API.getSystemUITemplateVersions( context.activeSystem , activeUITemplate )).response 
		if ( activeUITemplateVersions.length > 0)
		activeUITemplateVersions_selected = activeUITemplateVersions[ activeUITemplateVersions.length - 1 ];

	}

	async function createNewUITemplate(){
		const r = await context.API.createUITemplate(context.activeSystem,newUIName);
		if (r.responseCode == 200){		const r = await context.API.createUITemplate(context.activeSystem,newUIName);

			availableUITemplates.push(r.response);
			availableUITemplates = availableUITemplates;
		}	
	}

	async function showTemplate(){
	
		// create Component and things.
		const _component = SystemUITemplateViewer;
		
		context.dynamicFlowInComponent = {
			component: _component,
			props: {
				context:context,
				uitemplate : {
					name:activeUITemplate?.name,
					version:activeUITemplateVersions_selected
				}
			}
		}
		context.flowinActive.set(true);
	}
 
 
</script>
<div>

	<!-- UI Template Selecter and current Shower -->
	<section>
		<div>
			<b>UI-theme's</b>
			<div>
				<p> name    : {activeUITemplate?.name		?? '' }</p>
				<p> version : {activeUITemplate?.version	?? '' }</p>
			</div>
		</div>
		<div>
			<EditAbleList
				isEditableContainer={false}
				collection= { availableUITemplates.map(p => p.name) }
				onSelect={ (e) => { selectUITemplate(e); return true; } } 
				on:onDeSelect={ ()=>{ selectUITemplate(null) } }
			/> 
		</div>
		{#if activeUITemplate == null}
			<div transition:slide|local >
				<p>Create new UITemplate ? </p>
				<input type="text" bind:value={newUIName} placeholder="Create New UI Name">
				<button on:click={createNewUITemplate} >create</button>
			</div>
		{/if}
	</section>
	<br>
	{#if activeUITemplate != null}
		<section transition:slide|local >	
			<h3> Preview The layout </h3>
			<div>
				{#if activeUITemplateVersions}
					<select  bind:value={activeUITemplateVersions_selected} >
						{#each activeUITemplateVersions as version }
							<option value={version} >{version}</option>
						{/each}
					</select>
				{/if}
				{#if activeUITemplateVersions_selected}
					<button on:click={showTemplate} >show preview</button>
				{/if}
			</div>

			<h3> Upload New Version </h3>
			<SubSystemImporter 
				context		={context}
				uiTemplateName			= {activeUITemplate.name}
				currentUItemplateVers	= {activeUITemplate.version}
			/> 
		</section>
	{/if}
</div>