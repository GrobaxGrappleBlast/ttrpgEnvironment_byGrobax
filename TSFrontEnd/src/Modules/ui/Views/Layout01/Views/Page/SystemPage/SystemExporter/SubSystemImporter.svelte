<script lang="ts">
	import { slide } from "svelte/transition"; 
	import { createEventDispatcher } from "svelte";
    import { Layout01Context } from "../../../../context";
	
	let dispatch = createEventDispatcher();
	export let context :Layout01Context;
	let dropZone;
	let dragActive = false;


	function pd(e) {
		e.preventDefault();
		e.stopPropagation();
	}
	
	async function traversefolder( folder , formData , folderPath = ""){
		const reader = folder.createReader() 

		const entries : FileSystemEntry[] = await new Promise((resolve, reject) => {
			reader.readEntries((results) => {
				if (results.length === 0) {
					resolve([]);  // No more entries, resolve with empty array
				} else {
					resolve(results);  // Return the folder entries
				}
			});
		});
 
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			if (entry.isFile) { 

				 // Promisify entry.file() to await the file data
				const fileEntry = entry as FileSystemFileEntry;
				const file = await new Promise<File>((resolve, reject) => {
					fileEntry.file((fileData) => resolve(fileData), reject);
				});
				
				const filePath = folderPath + '/' + file.name; 
				formData.append( filePath , file );

			} else if (entry.isDirectory) { 
				const path = folderPath + '/' + entry.name;
				await traversefolder(entry,formData,path);
			}
		}  
	}

	// Handle the files dropped
	let formData : FormData;
	let formFiles: string[] = []
	let formLocked = false;
	async function drop(e) {

		e.preventDefault();
		e.stopPropagation();

		if (formLocked){
			return;
			console.error('form Was locked')
		}
		formLocked = true;

		try{
			const dt = e.dataTransfer;	
			formData = new FormData();	
			//const reader = dt.items[0].webkitGetAsEntry().createReader();
			
			const items =  dt.items;
			for (let i = 0; i < dt.items.length; i++) {
				const e = items[i];
				const d = e.webkitGetAsEntry();

				// if this is a Directory.
				if ( d.isDirectory ) {
					await traversefolder(d , formData);
				}
			}
			
			
			// Add to list 
			let keys = Array.from((formData as any).values());
			let _formFiles : Set<string> = new Set();
			for (let i = 0; i < keys.length; i++) {
				const key : string = keys[i] as string ;
				_formFiles.add(key);
			}
			formFiles = Array.from(_formFiles);
			
			 
		}
		catch(e){
			console.error(e)
			formLocked = false;
		}
		finally{
			formLocked = false;
		}
		// to debug use this line
		//	console.log( Array.from(formData.keys()) )
		//	console.log( Array.from(formData.values())[0] )


	}

	async function send(){

		var response = await context.API.adminSendBlockUITemplate( formData );
		console.log(response.responseCode)
		console.log(response.response)
		console.log(response.messages) 

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
	<div>
		{#each formFiles as file}
			<div> {file} </div>
		{/each}
	</div>
	<button on:click={send}> SEND </button>


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