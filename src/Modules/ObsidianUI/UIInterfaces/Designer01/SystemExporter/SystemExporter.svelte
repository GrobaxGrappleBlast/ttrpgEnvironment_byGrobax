<script lang="ts">

    import { SystemExporterMethods } from "../../../../../../src/Modules/ObsidianUI/UIInterfaces/Designer01/SystemExporter/SystemExporterMethods";

	import { writable, type Writable } from "svelte/store"; 
	import { TTRPGSystemJSONFormatting  } from "../../../../../../src/Modules/Designer/index";
	import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import './SystemExporter.scss'; 
    import { SystemPreview } from "../../../../../../src/Modules/ObsidianUICore/model/systemPreview";
    import exp from "constants";
    import { debug } from "console";
    


	export let system : Writable<TTRPGSystemJSONFormatting>;  
	export let preview	: Writable<SystemPreview> = writable();
	let exporter : SystemExporterMethods = new SystemExporterMethods();
	let messageHandler : StaticMessageHandler ;

	let text = '';
	let content:Blob;
	let content_URL:string;


	async function onclick(){
		
		text = await exporter.createBlockUITemplatefileTEST( $system ) ?? '';
	 
		return;
		/*

		let _content : Blob = await exporter.createBlockUITemplatefile($system) as Blob; 
		if(!_content)
			return;
		 
		content_URL = URL.createObjectURL(_content);
		content = _content;
		
		

		return;
		// Create a temporary anchor element
		const a = document.createElement('a');
		a.href = content_URL; 
		let sysName = ($system.systemName);
		sysName = sysName.replace(' ','').replace('\t','');
		a.download = sysName + "_UIExportDefaultTemplate";

		
		// Attach Click and Detach and Delete.
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
    	URL.revokeObjectURL(content_URL); 
		*/
	}

	
</script>
<div>
	<div class="SystemExporterbuttonRow">
		<div class="ExecutionButton" on:click={onclick} > Export UI Template </div>
		
		<pre style="max-width:500px;"  contenteditable="true" >
			{ text }
		</pre>
	
		<div class="ExecutionText" > Export the base system as a file that can be used to program a JS userinterface </div>
	</div> 
</div>