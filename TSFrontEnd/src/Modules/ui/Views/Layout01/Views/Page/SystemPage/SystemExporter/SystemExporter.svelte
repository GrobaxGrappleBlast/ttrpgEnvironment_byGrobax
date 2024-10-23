<script lang="ts">
    import { slide } from "svelte/transition";
	import EditAbleList from "../../../../../../../../../src/Modules/ui/Components/editAbleList/EditAbleList.svelte";
    import SubSystemImporter from "./SubSystemImporter.svelte";
    import { Layout01Context } from "../../../../context";

	export let context :Layout01Context;
	class subpages {
		public static importer = 'importer';
		public static exporter = 'exporter';
	}

	let subpage : string = '';
	function enableSubPage( _subpage : string ){ 
		subpage = _subpage;
	}
</script>
<div>
	<img src="http://localhost:5000/api/template/d4202be1-0313-4d3c-87c6-ebe5f23542ec/UITemplateName/image.jpg"/>
	{#if subpage == ""}
		<div transition:slide|local >
			<section>
				<br>
				<div>
					<b>UI-theme's</b>
					<div>
						<p> author : </p>
						<p> version : </p>
					</div>
				</div>
				<div>
					<EditAbleList
						isEditableContainer={false}
						collection= { ['theme - A','theme - B','theme - C'] }
						onSelect={ (e) => { return true; } } 
						on:onDeSelect={ ()=>{} }
					/> 
				</div>
			</section>  
			<br>
			<section class="SystemExporterOptions">
				<div>
					<button 
						class="SystemExporterButton"
						on:click={ () =>{enableSubPage(subpages.exporter)} }
						on:keypress
					> 
						Export New UI Project
					</button>
					<div>
						use this as a base for a ui theme that can be used for character sheets. 
					</div>
				</div>
				<div>
					<button 
						class="SystemExporterButton"
						on:click={ () =>enableSubPage(subpages.importer) }
						on:keypress
					> 
						Import a UI project
					</button>
					<div>
						click her, to Open Importer. 
					</div>
				</div>
			
			</section>  
			<section>
				<br>
				<div>
					click her, to Open Importer. details .... details .... details .... <br><br>
					details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details ....
				</div>
			</section>
		</div>
	{:else if subpage == subpages.exporter }
		<div transition:slide|local >
			<section>
				<div 
					class="SystemExporterOptionsCloseBtn"
					on:click={()=>enableSubPage('')} 
					on:keypress 
				>
					X
				</div>
				<div>
					
					<div>
						use this as a base for a ui theme that can be used for character sheets. 
					</div>
				</div>
				
			</section>  
		</div>
	{:else if subpage == subpages.importer }
		<div transition:slide|local >
			<SubSystemImporter 
				on:pageclose={ ()=>enableSubPage('') }
				context={context}
			/>
		</div>
	{/if}
</div>