<script lang="ts"> 
	import { fly, slide } from 'svelte/transition';
	import './ObsidianStandard.scss' 
    import './app.scss' 
    import Menu from '../Designer02/Views/Menu/Menu.svelte';//'../Views/Menu/Menu.svelte';
    import HomePage from './Views/Page/HomePage.svelte';
    import SystemPage from './Views/Page/SystemPage.svelte';
    import { TTRPGSystemJSONFormatting } from '../../../../../src/Modules/Designer';
    import { SystemPreview } from '../../../../../src/Modules/ObsidianUICore/model/systemPreview';
    import { writable } from 'svelte/store';

	let page = writable( 'system');
	
	let active_system	: TTRPGSystemJSONFormatting;
	let active_preview	: SystemPreview;
	
	function changePage( event ){
		page.set(event.detail); 
		console.log('changePage ' + page);
	}

 </script>
<div class="MainAppContainer" >
	
	<!-- Menu -->
	<Menu 
		regularOptions={['home','system']}
		on:changePage={changePage}
		startChosen={$page}	
	/>
	<section class="MainAppContainerPages">
		{#if 		$page == 'home'}
			<div in:fly={{x:100}} out:fly={{x:-100}} >
				<HomePage />
			</div>
		{:else if	$page == 'system'}
			<div in:fly={{x:100}} out:fly={{x:-100}} >
				<SystemPage />
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
 