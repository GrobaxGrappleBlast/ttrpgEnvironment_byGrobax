<script lang="ts">
    import { createEventDispatcher } from "svelte";

	export let special = false;
	let active;
	export function setActive( to : boolean){
		active = to;
	}
	let dispatch = createEventDispatcher();
	
	function onClick(){
		console.log('clickyy')
		dispatch('click')
	}
</script>
<div class={ special ? "MenuSBtn" : "MenuBtn"} on:click={onClick} on:keypress data-active={active} >
	<div class="MenuBtnIcon">
		X2
	</div>
	<div class="MenuBtnText">
		<h4>Home</h4>
		<p>Basic information and settings</p>
	</div>
</div>