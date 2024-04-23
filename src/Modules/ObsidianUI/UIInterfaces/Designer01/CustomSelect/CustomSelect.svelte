<script lang="ts">
	import { flip } from 'svelte/animate';
    import { onMount } from "svelte";
    import { slidefade } from '../Transitions/SlideFly';
	import './CustomSelect.scss'

	export let options	: string[];
	export let onSelect : ( v : string | null ) => any = (v) => null ;
	export let selected : string | null = null ;
	export let unSelectedplaceholder:string ='None Selected';
	export let disabled :boolean = false;
	export let isError 	:boolean = false;
	export let forceOpen:boolean = false;

	export let arrowPushRightPx: number = 0;
	export let maxHeight: string | null = null ;
	
	export function forceSelect( option , ignoreNotInOptions = false , triggerUpdate = false  ){
 
		let inOptions = ( options.find( p => p == option ) ?? null ) != null 
		if( !inOptions && !ignoreNotInOptions )
			return false

		selected = option

		if( triggerUpdate ){
			onSelect(selected)
		}
		return true
	}
	export function deSelect(){
		selected = null;
	}
	function _select(value){
		if ( selected == value ){
			selected = null
		}
		else {
			selected = value
		}
		onSelect(selected)
	}
	function _onSelect( e ){
		const value = e.target.innerHTML;
		_select(value);
	}

 

	let label;
	let blob;
	let arrow;
	let isFocussed = false;
	function onFocus(){
		//var relativeX = targetPoint.getBoundingClientRect().left - divRect.left;
	    //var relativeY = targetPoint.getBoundingClientRect().top - divRect.top;
		
		const rect1 = label.getBoundingClientRect();
		const rect2 = blob.getBoundingClientRect();

		
		const left = rect1.x - rect2.x;
		const offset = (rect1.width / 2) + left - 10;
		
		arrow.style.setProperty('left', offset + 'px');
		isFocussed = true;
	}
	function onblur(){
		isFocussed = false
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
			data-isAlwaysOpen={forceOpen} 
			on:focus={onFocus}
			on:blur={onblur}
		>
			{ selected == null ? unSelectedplaceholder : selected }
		</div>
	{/key}
	<!-- svelte-ignore missing-declaration -->
	<div class="GrobSelectOptionsWrapper"   >
			<div class="GrobSelectOptionsInnerWrapper" >
				<div 
					bind:this={arrow}
					class="Arrow" 
				></div>	
				<div 
					bind:this={blob}
					class="Blob" 
					style={maxHeight != null ? 'max-height:'+maxHeight : ''}>
					{#if isFocussed}
						{#each options as opt (opt)}
							<div animate:flip transition:slidefade class="GrobSelectOption"  tabindex="-1"  on:focus={_onSelect} >{opt}</div>
						{/each}
					{/if}
				</div>
			</div>
	</div>
</div>