<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { system, TNode } from "../../declaration"; 
    import { CNode, keyManager } from "../Structure/ComponentNode";
 
	
	//	export let node: TNode;
	export let sys : system; 
	export let editMode:boolean; 
	export let data :CNode;
	

	let node : TNode ; //= sys.fixed; // TODO: Get the node you want from here 
	let v = node?.getValue(); 
	const KEY = keyManager.getNewKey();

	onMount(()=>{ 
		node?.addUpdateListener( name+KEY+'SvelteView' , ()=>{
			v = node.getValue();
		})
	})
	onDestroy(()=>{
		node?.removeUpdateListener( name+KEY+'SvelteView');
	})

</script>
<div>
	<div>My View</div>
	<div>
		<div>
			{v} {data.id}
		</div>
		<div>
			{v} {data.id}
		</div>
		<div>
			{v} {data.id}
		</div>
	</div>
</div>