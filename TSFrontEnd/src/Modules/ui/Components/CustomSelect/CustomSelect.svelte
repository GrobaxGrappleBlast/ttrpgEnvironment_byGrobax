<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
    import { createEventDispatcher, onMount } from "svelte"; 
	import './CustomSelect.scss'
    import { slide } from 'svelte/transition';
   

	let dispatch = createEventDispatcher();
	export let options	: string[];
	export let selected : string | null = null ;
	export let unSelectedplaceholder:string ='None Selected';
	export let disabled :boolean = false;
	export let isError 	:boolean = false;
	export let forceOpen:boolean = false;
	export let maxHeight:number = 500;
    const svelteStandardAnimTime = 400;
 

	let label;
	let labelRect: DOMRect |null;
	let isFocussed = false; 
	let endTracker: HTMLDivElement;
	let topTracker: HTMLDivElement;
	let override_maxHeight : number = maxHeight; 
	let arrowOffsetLeft:number=0;

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
		recalculateWidth();
		setTimeout( recalculateHeight , svelteStandardAnimTime ) 
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
	function recalculateHeight(){
		let itemTop 	= topTracker.getBoundingClientRect().bottom
		let itemBottom 	= endTracker.getBoundingClientRect().bottom
		let windowBottom = window.document.body.getBoundingClientRect().height 
		if( itemBottom > windowBottom){
			let delta = itemBottom - windowBottom;
			let total = itemBottom - itemTop;
			let n = total - delta ;
			if ( n < override_maxHeight ){
				override_maxHeight = n;
			}
		} 
	}

	function recalculateWidth(){
		let width = label.getBoundingClientRect().width //- 16;
		arrowOffsetLeft = width/2;
	}

</script>
<div class="GrobSelect" >
	{#key selected}
		<div 
			bind:this={label}
			class={"GrobSelectLabel effect"}
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
						'max-height:'+override_maxHeight+'px'
					}  
					transition:slide
				> 
					<div class="ArrowContainer " bind:this={topTracker} >
						<div class="Arrow" style={`left:${arrowOffsetLeft}px`}></div>
					</div>
					{#each options as opt (opt)}
						<div  class="GrobSelectOption" role="none" data-selected={selected == opt} data-value={opt} on:click={ clickOption } on:keydown={clickOption}>
							{opt}
						</div>
					{/each}
					{#if options.length == 0}
						<i  class="GrobSelectInfo">No Options</i>
					{/if}
					<div class="selectEndTracker" bind:this={endTracker}></div>
				</div>
			 
		{/if}
	</div>
</div>