<script lang="ts"> 
	import { fly, slide } from 'svelte/transition';
    import './Designer.scss'  
    import HomePage from './Views/Page/HomePage.svelte';
    import SystemPage from './Views/Page/SystemPage.svelte';
    import { writable } from 'svelte/store';
	import Menu from './Views/Menu/Menu.svelte';
    import { Layout01Context } from './context';

	let page = writable( 'system');
	export let context	: Layout01Context; 
	
	function changePage( event ){
		page.set(event.detail);  
	}

 </script>
<div class="MainAppContainer" >
	
	<!-- Menu -->
	<Menu 
		regularOptions={['home','system','data tables','export','import']}
		on:changePage={changePage}
		startChosen={$page}	
	/>
	
	<section class="MainAppContainerPages">
		{#if 		$page == 'home'}
			<div in:fly={{x:100}} out:fly={{x:-100}} >
				<!--HomePage /-->
			</div>
		{:else if	$page == 'system'}
			<div in:fly={{x:100}} out:fly={{x:-100}} >
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
 