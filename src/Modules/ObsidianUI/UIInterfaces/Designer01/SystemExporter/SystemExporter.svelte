<script lang="ts">
	import SystemExporter from './SystemExporter.svelte';
    import { SystemExporterMethods } from "../../../../../../src/Modules/ObsidianUI/UIInterfaces/Designer01/SystemExporter/SystemExporterMethods";

	import { writable, type Writable } from "svelte/store"; 
	import { GrobCollection, GrobDerivedNode, GrobDerivedOrigin, GrobFixedNode, TTRPGSystem, type GrobNodeType } from "../../../../../../src/Modules/Designer";
	import StaticMessageHandler from "../BaseComponents/Messages/StaticMessageHandler.svelte";
	import './SystemExporter.scss';
    import { ObsidianUICoreAPI } from "../../../../../../src/Modules/ObsidianUICore/API";
    import { SystemPreview } from "../../../../../../src/Modules/ObsidianUICore/model/systemPreview";
    


	export let system : Writable<TTRPGSystem>;  
	export let preview	: Writable<SystemPreview> = writable();
	let exporter : SystemExporterMethods = new SystemExporterMethods();
	let messageHandler : StaticMessageHandler ;

	let text = '';

	function onclick(){
		text = exporter.convertToTTRPGSystemToGUIBuilderPreview($system);
	}

	
</script>
<div>
	<div class="SystemExporterbuttonRow">
		<div class="ExecutionButton" on:click={onclick} > Export Base System as File </div>
		<div class="ExecutionText" > Export the base system as a file that can be used to program a JS userinterface </div>
	</div>
	<pre contenteditable="true">
		{text}
	</pre>
</div>