<script lang="ts">
	import { slide } from "svelte/transition"; 
	import { createEventDispatcher } from "svelte";
	
	let dispatch = createEventDispatcher();

	let dropZone;
	let dragActive = false;
	/*
	
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
	*/
	function pd(e) {
		e.preventDefault();
		e.stopPropagation();
	}
	

	// Handle the files dropped
	function drop(e) {
		e.preventDefault();
		e.stopPropagation();

		const dt = e.dataTransfer;
		

		//const reader = dt.items[0].webkitGetAsEntry().createReader();
		//reader.readEntries( (entries)=>{
		//	console.log(entries);
		//})
//
		//console.log(reader)
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
	<br><br>
	<div 
		class="ImportDropZone" 
		bind:this={dropZone}
		data-dragActve={dragActive}
		on:dragover		= { (e) => { pd(e); dragActive = true  } }	
		on:dragend		= { (e) => { pd(e); dragActive = false } }
		on:dragleave	= { (e) => { pd(e); dragActive = false } }
		on:drop			= { (e) => { drop(e); dragActive = false  } }
	>
	

	</div>

	<div>
		<div>
			use this as a base for a ui theme that can be used for character sheets. 
		</div>
	</div>
	
</section>  
<style>
	.ImportDropZone{
		height:100px; 
		padding:20px;
		border:2px solid red;
		margin:20px; 
		background-color: white;
		border-radius: 5px;
	}

</style>