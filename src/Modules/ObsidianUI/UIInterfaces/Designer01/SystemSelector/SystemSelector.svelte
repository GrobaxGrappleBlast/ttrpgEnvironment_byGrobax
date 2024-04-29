
<script lang="ts">
    import GrobaxTTRPGSystemHandler from "../../../app";
    import SystemDescriptor from "./SystemDescriptor.svelte";
	import './SystemSelector.scss';
	import { createEventDispatcher } from "svelte"; 
    import { SystemPreview } from '../../../../../../src/Modules/ObsidianUI/core/model/systemPreview';

	let plugin: GrobaxTTRPGSystemHandler;
	const dispatch = createEventDispatcher();
	export let previews : SystemPreview[];
	let _active_preview : SystemPreview | undefined = undefined ;

	function onClickSystem( self ){
		debugger;
	}
 
</script>
<div class="SystemSelectorContainer" >
	<div class="SystemSelectorContainerHeader" >
		<div>
			<SystemDescriptor 
				data = { _active_preview }
			
			/>
		</div>
		<div class="SelectionContainer"  >
			<div class="GrobsInteractiveContainer" style="height:100%" >
				{#each previews as opt , i }
					<div class="SelectionContainerOption" on:click={onClickSystem} data-selected={opt.id == (_active_preview?.id ?? null )} > {opt.systemName} </div>
				{/each}
			</div>
		</div>
	</div>
</div>