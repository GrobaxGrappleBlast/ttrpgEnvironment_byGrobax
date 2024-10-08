<script lang="ts">
    import { createEventDispatcher } from "svelte";

	export let special	= false;
	export let text  	= "Basic information and settings";
	export let title 	= "Home";

	let active;
	export function setActive( to : boolean){
		active = to;
	}
	let dispatch = createEventDispatcher();
	
	function onClick(){ 
		dispatch('click')
	}
</script>
<div class={ special ? "MenuSBtn" : "MenuBtn"} on:click={onClick} on:keypress data-active={active} >
	<div class="MenuBtnIcon">
		X2
	</div>
	<div class="MenuBtnText">
		<!--h4>{title}</h4-->
		<p>{title}</p>
	</div>
</div>