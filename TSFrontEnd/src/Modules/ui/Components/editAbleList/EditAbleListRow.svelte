<script lang="ts">
    import { slide } from "svelte/transition";
    import { IViewElementUpdateable } from "../../Views/Layout01/SystemDesigner/UIGraphItems";
    import { tooltip } from "../Messages/toolTip";
	import Image_trash from "../buttons/trash.svelte";
	import Image_minus from "../buttons/minus.svelte";
	import Image_plus from "../buttons/plus.svelte";
    import Image_edit from "../buttons/edit.svelte"; 
	import Image_save from "../buttons/download.svelte"; 

    // {@const deleteIsAllowed=( !disabled && (onDeleteItem != null)  )  && !editIsActive  }

	export let editIsActive : boolean;
	export let element : IViewElementUpdateable;
	export let selected: IViewElementUpdateable; 
	export let deleteIsAllowed : boolean;
	export let disabled : boolean;
	export let onDelete					: ( item : IViewElementUpdateable ) => any ;
	export let onSelect					: ( item : IViewElementUpdateable ) => any ;
	export let onEditCancelSingle		: ( item : IViewElementUpdateable ) => any ;
	export let onEditFocus				: ( any : any ) => any ;

</script>
<div
	class="Editable_row" 
	data-selected={ !editIsActive && (element.key == selected?.key) }
	transition:slide|local
	data-can-hover={true}
	data-isEdit={ editIsActive && (element.name != element.nameEdit) } 
>
	{#if !editIsActive } 
		<div
			tabindex="-1" 
			contenteditable="false" 
			on:click={ () => { if( disabled ){ return }  onSelect(element)} }
			on:keyup 
			role="none"
		>  
			{ element.name } 
		</div>
	{:else}
		<div
			tabindex="1" 
			role="cell"
			contenteditable="true"
			on:focus={ onEditFocus }
			bind:textContent={ element.nameEdit } 
			autofocus={true}
		> 
		</div>
	{/if }
	
	<div> 
		{#if deleteIsAllowed } 
			<imageContainer  
				on:click={ () => onDelete( element ) }
				on:keyup 
				role="none"
				transition:slide|local
				use:tooltip={{ text: 'Delete item', type:'verbose' , }}
			>
				<Image_trash color={ 'white'}/>
			</imageContainer>   
		{:else if editIsActive && element.name != element.nameEdit }
			<imageContainer  
				on:click={ () => onEditCancelSingle(element) }
				on:keyup 
				role="none"
				transition:slide|local
				use:tooltip={{ text: 'Delete item', type:'verbose' , }}
			>
				<Image_minus color={ 'white'}/>
			</imageContainer>   
		{:else}
			<imageContainer > </imageContainer> 
		{/if} 
	</div> 
</div>