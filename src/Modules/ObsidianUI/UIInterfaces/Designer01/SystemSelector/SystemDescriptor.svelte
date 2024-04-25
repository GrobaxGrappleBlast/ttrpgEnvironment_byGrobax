<!--script lang="ts">
	import { SystemPreview } from '../../../../../../src/Modules/ObsidianUI/core/model/systemPreview';
    import { onMount } from 'svelte';
	import './SystemDescriptor.scss';
	
	export let data : SystemPreview = new SystemPreview();
	let _data 		: SystemPreview;
	const unknownString = ' no Value '

	onMount(()=>{
		_data = Object.assign( new SystemPreview() , data );
	})

</script>
<div class="SystemDescriptor" >
	<div>Author</div>
	<div>{_data?.author ?? unknownString}</div>

	<div>Version</div>
	<div>{_data?.version ?? unknownString}</div>

	<div>SystemCodeName</div>
	<div>{_data?.systemCodeName ?? unknownString}</div>

	<div>SystemName</div>
	<div>{_data?.systemName ?? unknownString}</div>
</div-->