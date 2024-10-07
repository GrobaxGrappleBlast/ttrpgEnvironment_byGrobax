<script lang="ts">
	import Designer from '../ui/Views/Layout01/Designer.svelte';
    import { IAPI } from '../api/IAPI';
    import { WebApiConnection } from '../api/WebAPIConnection';
    import { Layout01Context } from '../ui/Views/Layout01/context';	

	
	let context	: Layout01Context = new Layout01Context(); 
	let API : IAPI = new WebApiConnection();
	context.API = API;
	
</script>
<div>
	<Designer 
		context = {context}
	/>
</div>