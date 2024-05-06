
<script lang="ts">
    import GrobaxTTRPGSystemHandler from "../../../app";
    import SystemDescriptor from "./SystemDescriptor.svelte";
	import './SystemSelector.scss';
	import { createEventDispatcher } from "svelte"; 
    import { SystemPreview } from '../../../../../../src/Modules/ObsidianUI/core/model/systemPreview';
    import SelectableCollectionV2 from "../BaseComponents/editAbleList/EditAbleList.svelte";
    import { writable } from "svelte/store";

	let plugin: GrobaxTTRPGSystemHandler;
	const dispatch = createEventDispatcher();
	export let previews : SystemPreview[] = [];
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
		<div class="GrobsInteractiveContainer SystemSelectorOptionsContainer">
		 
			<SelectableCollectionV2 
				isEditableContainer={false}
				collection={ previews.map(p => p.systemName ) }
				onSelect={ (s) =>{console.log(s); return true} }
				onAdd={ () => { return {} }}
			/>
		 
		</div>
	</div>
</div>