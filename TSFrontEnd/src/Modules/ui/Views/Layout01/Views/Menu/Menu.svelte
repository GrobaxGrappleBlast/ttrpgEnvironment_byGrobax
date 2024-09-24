<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import MenuBtn from "./MenuBtn.svelte";
    import { on } from "events";

	export let regularOptions : string[] = []
	export let specialOptions : string[] = [];
	export let startChosen : string = "";
	$: options = regularOptions.concat(...specialOptions);
	let dispatch = createEventDispatcher();
	
	
	let btnArr : MenuBtn[] = [];
	let chosen : MenuBtn | null = null;
	function onBtnClick( i ){
		const btn = btnArr[i];
		if(btn == chosen){
			return;
		}

		if(chosen)
			chosen.setActive(false)

		btn.setActive(true);
		chosen = btn;
		dispatch('changePage', options[i]);
	}
 
	onMount(()=>{
		let i = options.findIndex( p => p == startChosen );
		if(i != -1){
			onBtnClick(i);
		}
	})
</script>
<div class="Menu" >
	<div class="MenuTitle" >
		<p>TTP-RPG System Designer</p>
		<div class="colorscheme">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	</div>
	<section class="MenuBtnContainer" >
		{#each options as opt,i }
			<MenuBtn 
				special={specialOptions.includes(opt)}
				title={opt}
				bind:this={btnArr[i]}
				on:click={() => onBtnClick(i)}
			/>	
		{/each}
	</section>
</div>