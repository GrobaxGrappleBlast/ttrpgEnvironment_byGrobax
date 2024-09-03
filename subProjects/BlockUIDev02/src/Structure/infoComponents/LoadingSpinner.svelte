<script lang="ts">
    import type { Writable } from "svelte/store";
    import { fly } from "svelte/transition";


	export let active : Writable<boolean>; 
	let _active : boolean;
	let _subActive : boolean;	

	// set to fade in sub active then that goes out after 400 ms if it has not ben reactivated;
	active.subscribe( p => {
		if(!p){
			_active = false;
			_subActive = true;
			scheduleSubDeactivation();
		}
		else
		{
			_active		= true;
			_subActive	= true;
		}
	});

	function scheduleSubDeactivation(){
		setTimeout(() => {
			if(!$active)
				_subActive = false;
		}, 1000);
	}


</script>
<div class="LoadingSpinner" > 
	{#if _active}
		<div class="spinner" data-state="ongoing" transition:fly={{x:100}} >
			EDIT
		</div>
	{:else if _subActive }
		<div class="spinner" data-state="finished" transition:fly={{x:100}}  >
			SAVED
		</div>
	{/if}
</div>