<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
    import { createEventDispatcher, onMount } from "svelte"; 
    import { slide } from 'svelte/transition';
    import { Layout01Context } from '../../Views/Layout01/context';
	import { tick } from 'svelte';
    import { selectSlide } from './selectSlide';
    import { Console } from 'console';


	let dispatch = createEventDispatcher();
	export let options	: string[];
	export let selected : string | null = null ;
	export let unSelectedplaceholder:string ='None Selected';
	export let disabled :boolean = false;
	export let isError 	:boolean = false;
	export let forceOpen:boolean = false;
    export let context	: Layout01Context ;
	const svelteStandardAnimTime = 400;

	let label;
	let isFocussed = false; 
	let endTracker: HTMLDivElement;
	let self: HTMLElement;
	let popUp:HTMLElement;
	
	async function onFocus(){
		isFocussed = true;  
	} 

	function click( e ){
		debugger
		isFocussed = false;
		console.log('click')
	}

	function hasTargetParent( DOM:HTMLElement , target:HTMLElement ){
			const parent = DOM?.parentElement ?? null ;
			if (parent){
				if (parent != target){
					return hasTargetParent( parent , target );
				}
				else{
					
					return true;
				}
			}else{ 
				return false;
			}
	} 
	function blur( e ){ 
		isFocussed=false;
	} 
	function clickOption( opt , ...params){ 
		
		let value = opt;
		if (selected != value){
			selected = value;
			dispatch('onSelect',selected)
		}
		isFocussed = false;  
	}

</script>
<div class="GrobSelect" bind:this={self}>
	{#key selected}
		<div 
			bind:this={label}
			class={"GrobSelectLabel effect"}
			data-isDisabled	={disabled	?? false}
			data-isError	={isError	?? false} 
			data-selected	={selected	?? false} 
			tabindex="-1"  
			on:focus={onFocus}
			on:blur={ blur } 
		>
			{ selected == null ? unSelectedplaceholder : selected } 
		</div>
	{/key}
	<!-- svelte-ignore missing-declaration -->
	<div>
		{#if isFocussed || forceOpen } 
			<div 
				class="SelectPopUp" 
				data-direction="down"
				transition:selectSlide={{container : context?.mainAppContainer, button:self }}
				bind:this={popUp}
			> 	
				<div
				
				>
					{#if options.length == 0}
						<i  class="GrobSelectInfo">No Options</i>
					{:else}	
						{#each options as opt (opt)}
							<button  
								class="GrobSelectOption" 
								data-selected={selected == opt} 
								data-value={opt} 
								on:focus={ ( ...params ) => clickOption(opt, ...params) } 
							>
								{opt}
							</button>
						{/each}
					{/if}
					<div 
						class="selectEndTracker"
						bind:this={endTracker}
					>
					</div>
				</div>
			</div> 
		{/if}
	</div>
</div>