<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
    import { createEventDispatcher, onMount } from "svelte";
    import { slidefade } from '../../Transitions/SlideFly';
	import './CustomSelect.scss'
    import { slide } from 'svelte/transition';

	let dispatch = createEventDispatcher();
	export let options	: string[];
	export let onSelect : ( v : string | null ) => any = (v) => null ;
	export let selected : string | null = null ;
	export let unSelectedplaceholder:string ='None Selected';
	export let disabled :boolean = false;
	export let isError 	:boolean = false;
	export let forceOpen:boolean = false;
	export let maxHeight:number = 500;
 

	let label;
	let labelRect: DOMRect |null;
	let isFocussed = false; 
	function onFocus(){
		
		const rect1 = label.getBoundingClientRect();
		/*
			const rect2 = blob.getBoundingClientRect();

			const left = rect1.x - rect2.x;
			const offset = (rect1.width / 2) + left - 10;
			
			arrow.style.setProperty('left', offset + 'px');
		*/ 
		labelRect= rect1;
		isFocussed = true;
	}
	function onblur(){
		setTimeout( () => {
			isFocussed = false
		}, 200) 
	}

	function clickOption( event ){
		 
		let value = event.target.getAttribute('data-value');
		if (selected == value){
			selected = null;
			dispatch('onDeselect')
		} else {
			selected = value;
			dispatch('onSelect',selected)
		}
		
	}

</script>
<div class="GrobSelect" >
	{#key selected}
		<div 
			bind:this={label}
			class="GrobSelectLabel effect"
			data-isDisabled	={disabled	?? false}
			data-isError	={isError	?? false} 
			data-selected	={selected	?? false} 
			tabindex="-1"  
			on:focus={onFocus}
			on:blur={ onblur }
		>
			{ selected == null ? unSelectedplaceholder : selected }
		
		</div>
	{/key}
	<!-- svelte-ignore missing-declaration -->
	<div>
		{#if isFocussed || forceOpen }
			<div 
				class="SelectPopUp" 
				style={ 
					"width:" + ((labelRect?.width) ?? 100 )+ "px;" + 
					"left: " + ((labelRect?.x) ?? 0) + "px;" +
					"top: "  + (((labelRect?.y) ?? 0) + ((labelRect?.height) ?? 0) + 8) + "px;"+
					(maxHeight != null ? 'max-height:'+maxHeight : '')
				}  
				transition:slide
			>
				<div class="Arrow" ></div>	
				{#each options as opt (opt)}
					<div  class="GrobSelectOption" data-selected={selected == opt} data-value={opt} on:click={ clickOption } on:keydown={clickOption}>
						{opt}
					</div>
				{/each}
				{#if options.length == 0}
					<i  class="GrobSelectInfo">No Options</i>
				{/if}
			</div>
		{/if}
	</div>
</div>