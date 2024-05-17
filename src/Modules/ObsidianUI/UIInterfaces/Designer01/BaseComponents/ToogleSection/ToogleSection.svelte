<script lang="ts">

	export let title : string ;
	let toogled = false;

</script>
<div>
	<div class="toogleSectionHeader" on:click={ () => { toogled = !toogled }}>
		<p>{title}</p>
	</div>
	<div class="toogleSectionBody" > 
		{#if toogled}
			<div>
				<slot />
			</div>
		{/if}
	</div>
</div>