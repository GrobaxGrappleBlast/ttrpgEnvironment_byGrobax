<script lang="ts">
	import { slide } from "svelte/transition"; 
	import { createEventDispatcher } from "svelte";
	
	let dispatch = createEventDispatcher();


	let dropZone;
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		dropZone.addEventListener(eventName, preventDefaults, false);
		//document.body.addEventListener(eventName, preventDefaults, false);
	});
	dropZone.addEventListener('dragover', () => {
		dropZone.classList.add('hover');
	});
	dropZone.addEventListener('dragleave', () => {
		dropZone.classList.remove('hover');
	});
	dropZone.addEventListener('dragEnd', () => {
		dropZone.classList.remove('hover');
	}); 
	dropZone.addEventListener('drop', handleDrop, false);
	function preventDefaults(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	// Handle the files dropped
	function handleDrop(e) {
		const dt = e.dataTransfer;
		const files = dt.files;


		debugger 
	}



</script>

<section>
	<div 
		class="SystemExporterOptionsCloseBtn"
		on:click={()=>dispatch('pageclose')}
		on:keypress
	>
		X
	</div>
	
	<div class="ImportDropZone" bind:this={dropZone}>
	

	</div>

	<div>
		<div>
			use this as a base for a ui theme that can be used for character sheets. 
		</div>
	</div>
	
</section>  
<style>
	#ImportDropZone{
		height:100px;
		width:100%;
		padding:20px;
		border:1px solid red;
		margin:20px;
	}

</style>