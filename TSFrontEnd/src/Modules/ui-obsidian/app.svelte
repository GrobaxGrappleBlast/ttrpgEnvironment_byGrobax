<script lang="ts">
	import Designer from '../ui/Layout01/Designer.svelte';
    import { IAPI } from '../api/IAPI';
    import { ObsidianAPI } from '../api/ObsidianAPI';
    import { WebApiConnection } from '../api/WebAPIConnection';
    import { Layout01Context } from '../ui/Layout01/context';

	
	let context	: Layout01Context = new Layout01Context(); 
	let API : IAPI = new ObsidianAPI();
	context.API = API;
	
</script>
<div>
	<Designer 
		context = {context}
	/>
</div>