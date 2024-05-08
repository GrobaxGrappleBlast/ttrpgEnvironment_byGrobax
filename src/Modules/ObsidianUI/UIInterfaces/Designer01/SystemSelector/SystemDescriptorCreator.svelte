<script lang="ts">
	import { FileContext } from '../../../../../../src/Modules/ObsidianUI/core/fileContext'; 
	import { SystemPreview } from '../../../core/model/systemPreview';
    import { onMount } from 'svelte';
	import './SystemDescriptor.scss';
	import { StringFunctions } from '../BaseFunctions/stringfunctions';
	import StaticMessageHandler from '../BaseComponents/Messages/StaticMessageHandler.svelte';
	import { MessageTypes } from '../BaseComponents/Messages/StaticMessageHandler.svelte';

	export let data : SystemPreview = new SystemPreview();
	export let onEnd :( preview: SystemPreview | null ) => any|null ;
	let _data 		: SystemPreview = new SystemPreview(); 

	let messageHandler:StaticMessageHandler ;
	let isValidated = false;

	onMount(()=>{
		_data = Object.assign( new SystemPreview() , data );
	}) 

	async function validate		(){
		let isValid = true;
		messageHandler.removeAllMessages();

		let _ = ''; 
		// Author 
		if( !_data.author  ){	
			messageHandler.addMessageManual('author1','a author is not required but helpfull to users', MessageTypes.verbose as any )
		}

		// Version 
		if( !_data.version  ){	
			messageHandler.addMessageManual('version1','a version is not required but helpfull to users', MessageTypes.verbose as any )
		}

		// SystemCodeName 
		if( !_data.systemCodeName  ){	
			isValid = false;  
			messageHandler.addMessageManual('systemCodeName1','Did not have a systemCodeName.\n can only contain regular letter and numbers, no special characters or whitespace', MessageTypes.error as any )
		}else if (!StringFunctions.isValidSystemCodeName(_data.systemCodeName)){
			isValid = false;  
			messageHandler.addMessageManual('systemCodeName2','Did not have a systemCodeName.\n can only contain regular letter and numbers, no special characters or whitespace', MessageTypes.error as any )
		}

		// SystemName No \n characters.
		if( !_data.systemName  ){	
			isValid = false;  
			messageHandler.addMessageManual('systemName1','Did not have a system name.', MessageTypes.error as any )
		}else if (!StringFunctions.isValidWindowsFileString(_data.systemName)){
			isValid = false;  
			messageHandler.addMessageManual('systemName2','Did not have a valid system name', MessageTypes.error as any )
		}

		// folder only allow windows folder name accepted folder names.
		if( !_data.folderName  ){	

			let newFoldername = await recursiveFindNewFolderName(0,5);
			if(!newFoldername){
				messageHandler.addMessageManual('folder1','A new folder name is required, Must be unique', MessageTypes.error as any )
			}else{
				_data.folderName = newFoldername//
				messageHandler.addMessageManual('folder1','Did not have a folder name so created one', MessageTypes.verbose as any )
			}
		} 
		else if (!StringFunctions.isValidWindowsFileString(_data.folderName)){ 
			isValid = false;  
			messageHandler.addMessageManual('folder2','folder name was not valid windows folder name')
		} 

		if (isValid){
			messageHandler.addMessageManual('all','All is Good', MessageTypes.good as any )
			isValidated = true;
		}
	}
	function createSystem	(){
		if(!isValidated)
			return;
		onEnd( _data );
	}
	function cancel			(){
		onEnd( null );
	}
	function _onChange(){
		isValidated = false;
		messageHandler.removeAllMessages();
		validate();
	} 
	async function recursiveFindNewFolderName( depth = 0, maxDepth = 5){

		if(depth == maxDepth){
			return null;
		}

		let uuid = StringFunctions.uuidShort();
		if(await FileContext.systemDefinitionExistsInFolder(uuid)){
			return this.recursiveFindNewFolderName(depth + 1);
		}
		return uuid;
	}

</script>
<div>
	<StaticMessageHandler 
		bind:this={messageHandler} 
	/>
	<div style="height:5px;"></div>
	<div class="SystemDescriptorCreator"  >

		<div>Author</div> 
		<input type="text" class='SystemDescriptorEditField'  on:change={_onChange}  bind:value= { _data.author } />

		<div>Version</div> 
		<input type="text" class='SystemDescriptorEditField' on:change={_onChange}  bind:value={_data.version} />

		<div>SystemCodeName</div> 
		<input type="text" class='SystemDescriptorEditField' on:change={_onChange}  bind:value={_data.systemCodeName} />

		<div>SystemName</div> 
		<input type="text" class='SystemDescriptorEditField' on:change={_onChange}  bind:value={_data.systemName} />
	
		<div>folder name</div> 
		<input type="text" class='GrobsInteractiveContainer SystemDescriptorEditField' on:change={_onChange}  bind:value={_data.folderName} />
	 
	</div>
	<div class="SystemDescriptorButtonRow" >
		<div class="SystemDescriptorButton" on:click={validate}		>Validate		</div>
		<div class="SystemDescriptorButton" on:click={createSystem}	data-disabled={!isValidated} >Create			</div>
		<div class="SystemDescriptorButton" on:click={cancel}		>Cancel Creation</div>
	</div>
</div>