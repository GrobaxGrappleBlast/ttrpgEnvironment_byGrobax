<script lang="ts">
    import { slide } from "svelte/transition";
	import './ToogleSection.scss'

	export let title : string ;
	let toogled = false;

</script>
<div>
	<div class="toogleSectionHeader" on:click={ () => { toogled = !toogled }}>
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