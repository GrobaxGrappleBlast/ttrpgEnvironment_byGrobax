<script lang="ts">
    import { slide } from "svelte/transition";
	import './ToogleSection.scss'
    import { createEventDispatcher } from "svelte";

	export let title : string ;
	let dispatch = createEventDispatcher();
	let toogled = false;

	export function toogle( forceState : boolean | null = null ){
		let origState = toogled;
		if ( forceState == null ){
			toogled = !toogled;
		}
		else {
			toogled = forceState;
		}

		// avoid updating if the state is unchanged
		if(toogled == origState)
			return;

		if(toogled){
			dispatch('close')
		}else{
			dispatch('open')
		}
	
	}

	

</script>
<div>
	<div class="toogleSectionHeader" on:click={ () => toogle() }>
		<p>{title}</p>
	</div>
	<div class="toogleSectionBody" > 
		{#if toogled}
			<div transition:slide >
				<slot />
			</div>
		{/if}
	</div>
</div>