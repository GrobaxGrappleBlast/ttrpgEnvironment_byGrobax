<script lang="ts">
    import type { ITTPRGSystem } from "./exported";
	export let system :ITTPRGSystem;
	console.log('START COMPONENT')
	let a = system ? 'A' : 'B' ;
</script> 
<div>
	{a};
	HEJ HANS ;
</div>