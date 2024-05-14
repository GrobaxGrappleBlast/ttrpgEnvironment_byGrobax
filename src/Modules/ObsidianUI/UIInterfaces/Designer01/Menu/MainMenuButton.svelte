<script lang="ts">
    import { slide } from "svelte/transition";
	import './MainMenuButton.scss'
	export let selected:boolean = false ;
	export let disabled : boolean = false;
	export let onClick : ( e ) => any ;
</script>


<div class="MainMenuButton" >
	<div class="MainMenuButton_icon" data-selected={selected} data-disabled={disabled} on:click={onClick} >
		Select
	</div>
	<div class="MainMenuButton_desc">
		<p>System Selector		</p>
	</div>
</div>