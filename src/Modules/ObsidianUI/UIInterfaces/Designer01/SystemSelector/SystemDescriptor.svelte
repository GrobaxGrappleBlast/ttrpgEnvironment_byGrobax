<script lang="ts">
	
    import { onMount } from 'svelte';
	import './SystemDescriptor.scss';
    import { SystemPreview } from '../../../../../../src/Modules/ObsidianUICore/model/systemPreview';
	
	export let data : SystemPreview = new SystemPreview();
	export let edit : boolean  = false;
	let _data 		: SystemPreview;
	const unknownString = ' no Value '

	onMount(()=>{
		_data = Object.assign( new SystemPreview() , data );
	}) 
</script>
<div class="SystemDescriptor" data-is-edit={ false } >

	<div>Author</div> 
	<div >{_data?.author ?? unknownString}</div>

	<div>Version</div> 
	<div >{_data?.version ?? unknownString}</div>

	<div>SystemCodeName</div> 
	<div >{_data?.systemCodeName ?? unknownString}</div>

	<div>editable</div> 
	<div >{_data?.isEditable ?? 'unknown'}</div>

	<div>SystemName</div> 
	<div >{_data?.systemName ?? unknownString}</div>
 
	<div>folder name</div> 
	<div >{_data?.folderName ?? unknownString}</div>
 
</div>