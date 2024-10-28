<script lang="ts">
    import { onMount } from "svelte";


	import EditAbleList from 					"../../../../Components/editAbleList/EditAbleList.svelte"; 
    import StaticMessageHandler from 			"../../../../Components/Messages/StaticMessageHandler.svelte";
    import { Writable, writable } from "svelte/store";
    import { fade, slide } from "svelte/transition";
    import { Layout01Context } from "../../context";
    import { TTRPGSystemJSONFormatting } from 	"../../../../../../../src/Modules/graphDesigner/index";
    import { SystemPreview } from 				"../../../../../../../src/Modules/core/model/systemPreview";
    
    import Menu from "../Menu/Menu.svelte";
    import { pageSlide } from 	"../../../../../../../src/Modules/ui/Components/Transitions/pageSlide";
    import SystemDesigner3Parts from "./SystemPage/SystemDesigner/SystemDesigner3Parts.svelte";
    import SystemExporter from "./SystemPage/SystemExporter/SystemExporter.svelte";
    import SystemTester from "./SystemPage/SystemTester/SystemTester.svelte";
    
	export let context	: Layout01Context; 
	let activeFactory : TTRPGSystemJSONFormatting = context.activeFactory;
	let availSystems : SystemPreview[] = [];
	
	const nullpreview = new SystemPreview();
	let activePreview: SystemPreview = nullpreview;
	let unknownString = 'unknown';

	let factory : TTRPGSystemJSONFormatting | null = null;
	

 
	onMount( () => {
		availSystems = context.availablePreviews ?? [];
		loadAllSystems();
	})

	async function loadAllSystems(){
		let response = await context.API.getAllSystems();
		context.availablePreviews = response.response;
		availSystems = response.response;
	}

	function unloadPreview(){
		activePreview = nullpreview
		factory = null;
	}
	async function onSelectSystem( d ){
		const pre = availSystems.find( p => p.code == d); 

		// if no preview... then no. or if the preview is the same as before deselct it
		if ( activePreview == pre || !pre){
			activePreview = nullpreview;
			return false;
		}

		// select it
		activePreview = pre;
		context.activeSystem = pre;

		// request the factory;
		let response = await context.API.getFactory( activePreview );
		factory = response.response as TTRPGSystemJSONFormatting;
		context.activeFactory = factory;
		return true;
	}

	let pagesContainer;
	let editPages = ['designer','UI-designer','UI-Tester'];
	let activeSubPage = 'designer';
	function changePage( event ){
		activeSubPage = event.detail;
	}
	//@ts-ignore This is for rendering the unknown strnig
	nullpreview.isEditable = null;


</script>

<div class="MainAppContainerPage MainAppContainerPageSystem">
	 
	<section>
		<div class="table SystemPreviewer" data-is-edit={ false } transition:fade>
			<div class="tableRow">
				<div class="tableRowColumn">Author</div> 
				<div class="tableRowColumn" >{activePreview?.author ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">Version</div> 
				<div class="tableRowColumn" >{activePreview?.version ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">SystemCodeName</div> 
				<div class="tableRowColumn" >{activePreview?.code ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">editable</div> 
				<div class="tableRowColumn" >{activePreview?.isEditable ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">SystemName</div> 
				<div class="tableRowColumn" >{activePreview?.name ?? unknownString}</div>
			</div>
			<div class="tableRow">
				<div class="tableRowColumn">folder name</div> 
				<div class="tableRowColumn" >{activePreview?.folderName ?? unknownString}</div>
			</div>
		</div>

		<br>
		<!-- System Selector -->
		<div class="PageSystemList" >	
			<EditAbleList
				isEditableContainer={false}
				collection= { availSystems?.map( p => {return { key : p.code , value : p.name}}) ?? [] }
				onSelect={ (e) => {onSelectSystem(e) ; return true; } } 
				on:onDeSelect={ unloadPreview }
			/> 
		</div>  
	</section>
	{#if factory && activePreview != nullpreview }
		
		<section>
			<Menu  
				regularOptions={editPages}
				on:changePage={changePage}
				startChosen={activeSubPage}	
			/> 
		</section>
		<section bind:this={pagesContainer} >
			{#if activeSubPage == 'designer'}
				<div transition:pageSlide={{parent:pagesContainer}} >
					<SystemDesigner3Parts 
						system	={ factory }
						context ={ context }
					/>
				</div>
			{:else if activeSubPage == 'UI-designer'}
				<div transition:pageSlide={{parent:pagesContainer}} >
					<SystemExporter 
						context={context}
					
					/>
				</div>
			{:else if activeSubPage == 'UI-Tester'}
				<div transition:pageSlide={{parent:pagesContainer}} >
					<SystemTester
						context={context}
					
					/>
				</div>
			{:else if activeSubPage == 'test'}
				<div transition:pageSlide={{parent:pagesContainer}} >
					<h1>asdadsadsasdadsasdauuuuh</h1>
				</div>
			{/if}
		</section>
	{/if}
</div>