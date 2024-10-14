<script lang="ts"> 
	import { fly, slide } from 'svelte/transition';
    import './Designer.scss'  
    import HomePage from './Views/Page/HomePage.svelte';
    import SystemPage from './Views/Page/SystemPage.svelte';
    import { writable } from 'svelte/store';
	import Menu from './Views/Menu/Menu.svelte';
    import { Layout01Context } from './context';
	import {pageSlide} from '../../../../../src/Modules/ui/Components/Transitions/pageSlide.js';
    import { onMount } from 'svelte';

	let page = writable( 'system');
	export let context	: Layout01Context; 
	let mainAppContainer;
	
	function changePage( event ){
		page.set(event.detail);  
	}

	onMount(()=>{
		context.mainAppContainer = mainAppContainer;
	})

	let pagesContainer;
 </script>
<div id="MainAppContainer" bind:this={mainAppContainer}>
	
	<!-- Menu -->
	<Menu 
		title={'TTP-RPG System Designer'}
		regularOptions={['home','system','data tables','export','import']}
		on:changePage={changePage}
		startChosen={$page}	
	/> 
	<section class="MainAppContainerPages" bind:this={pagesContainer}>
		{#if 		$page == 'home'}
			<div transition:pageSlide={{parent:pagesContainer}} >
				<HomePage /> 
			</div>
		{:else if	$page == 'system'}
			<div transition:pageSlide={{parent:pagesContainer}}>
				<SystemPage
					context = {context}
				/>
			</div>
		{:else if	$page == 'home1'}
			<p>1</p>
		{:else if	$page == 'home2'}
			<p>1</p>
		{:else if	$page == 'home3'}
			<p>1</p>
		{/if}
	</section>
</div>
<style>
	#MainAppContainer{
		container-type: inline-size;  
		min-height: inherit;
	}
</style>