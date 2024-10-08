<script lang="ts">
	import Designer from '../ui/Views/Layout01/Designer.svelte';
    import { IAPI } from '../api/IAPI';
    import { ObsidianAPI } from '../api/ObsidianAPI';
    import { WebApiConnection } from '../api/WebAPIConnection';
    import { Layout01Context } from '../ui/Views/Layout01/context';	
    import PluginHandler from './app';

	export let pluginHandler : PluginHandler;
	let context	: Layout01Context = new Layout01Context(); 
	let API : IAPI = new ObsidianAPI(pluginHandler);
	context.API = API;
	
</script>
<div id="SvelteContainerForTTPRPGSystem" >
	<Designer 
		context = {context}
	/>
</div>
<style></style>