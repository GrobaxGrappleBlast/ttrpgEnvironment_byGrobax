<script lang="ts">
    import { slide } from "svelte/transition";
    import FixedItemDesigner from "./FixedItemDesigner.svelte";
    import DerivedItemDesigner from "./DerivedItemDesigner.svelte";
    import DerivedCollectionDesigner from "./DerivedCollectionDesigner.svelte";
    import { onDestroy, onMount } from "svelte";
	import { Layout01Context } from "../../../../context";

	import { TTRPGSystemJSONFormatting } 	from "../../../../../../../../../src/Modules/graphDesigner";
    import EditAbleList2 					from "../../../../../../../../../src/Modules/ui/Components/editAbleList/EditAbleList2.svelte";
    import ToogleSection 					from "../../../../../../../../../src/Modules/ui/Components/toogleSection/toogleSection.svelte";
	import StaticMessageHandler 			from '../../../../../../../../../src/Modules/ui/Components/Messages/StaticMessageHandler.svelte'
    import { StringFunctions } 				from "../../../../../../../../../src/Modules/core/BaseFunctions/stringfunctions";
	import { UISystem } 					from "../../../../../../../../../src/Modules/graphDesigner/UIComposition/UISystem";
    import { UICollection } 				from "../../../../../../../../../src/Modules/graphDesigner/UIComposition/UICollection";
    import { UINode } 						from "../../../../../../../../../src/Modules/graphDesigner/UIComposition/UINode";
    import FeatureDesigner from "./FeatureDesigner/FeatureDesigner.svelte";

    export let context	: Layout01Context; 
    export let system : TTRPGSystemJSONFormatting;
    let uiSystem : UISystem | null = context.uiSystem ?? new UISystem(system);
	let guidKey	: string =  context.uiGuid ?? 'designer'+StringFunctions.uuidv4();
	context.uiSystem = uiSystem;
	context.uiGuid = guidKey;


	// Derived Fixed Logic
	let derivedGrp	= uiSystem.groups.find( p => p.name == 'derived');
	let fixedGrp	= uiSystem.groups.find( p => p.name == 'fixed');

	let derivedCol	: UICollection | null = null;
	let fixedCol	: UICollection | null = null;

	let derivedNod	: UINode | null = null;
	let fixedNod	: UINode | null = null;

	// Special 
	let specialOn = false; 

	let designerFixed : FixedItemDesigner;
	let designerDerived : DerivedItemDesigner;
	function designerUIUpdate(){
		designerDerived?.forceUpdate();
		designerFixed?.forceUpdate();
	}

	function _colSelect( grp:'derived'|'fixed' , col :  UICollection	|null|any){
		_nodSelect(grp,null);

		
		if (grp == 'derived') {
			// first remove listener for old 
			if (derivedCol){
				derivedCol?.removeEventListener(guidKey);
			}
			
			// set variable and event listener
			derivedCol = col; 
			derivedCol?.addEventListener(guidKey, 'update' ,() => {
				derivedCol = derivedCol;
			})
		}
		else {
			// first remove listener for old 
			if (fixedCol){
				fixedCol?.removeEventListener(guidKey);
			} 

			// set variable and event listener
			fixedCol = col; 
			fixedCol?.addEventListener(guidKey, 'update' ,() => {
				fixedCol = fixedCol;
			})
		}
	}
	function _nodSelect( grp:'derived'|'fixed' , nod : UINode |null|any){		
		
		
		if (grp == 'derived') {
			
			derivedNod?.removeEventListener(guidKey)
			derivedNod = nod;
			derivedNod?.addEventListener(guidKey,'update',() => {
				designerUIUpdate();
			})
		}
		else {
			fixedNod?.removeEventListener(guidKey)
			fixedNod = nod;
			fixedNod?.addEventListener(guidKey,'update',() => {
				designerUIUpdate();
			})
		}
	}

	function _colUpdate	( grp:'derived'|'fixed' , colArr :  UICollection[] | any[] ){

		if(!uiSystem){
			console.error('NoUISystem when calling _ColUpdate')
			return;
		}

		colArr.forEach( n  => {
			if( n.name != n.nameEdit){
				uiSystem.renameCollection( grp , n.name, n.nameEdit );
			}
		});
	}
	function _nodUpdate	( grp:'derived'|'fixed' , nodArr :  UINode[] | any[] ){
		
		if(!uiSystem){
			console.error('NoUISystem when calling _nodUpdate')
			return;
		}	

		let col = grp == 'derived' ? derivedCol : fixedCol;
		if (!col)
			return;

		nodArr.forEach( n  => {
			if(n.name != n.nameEdit){
				uiSystem.renameNode( grp , col.name , n.name, n.nameEdit );
			}
		});
	}

	const designerKey = 'sysDesigner'
	onMount		(()=>{
		derivedGrp?.addEventListener(designerKey,'update',()=>{
			_colSelect('derived',null);
			
		})
	})
	onDestroy	(()=>{
		derivedGrp?.removeEventListener(designerKey);
	})

	let messageHandler : StaticMessageHandler;

</script>
<div>
	<StaticMessageHandler 
		bind:this={messageHandler}
	/>
	
	{#if specialOn}
		<div >
			<DerivedCollectionDesigner 
				context={context}
				system={uiSystem}
				secondSlideInReady={true}
				messageHandler = {messageHandler}
				on:close={ () => {specialOn = false} }
			/>
		</div>
	{:else}
		<div transition:slide|local>
			<ToogleSection 
				title="fixed"
			>
				<div>
					<h1>Fixed Item Design</h1>
					<p>
						Fixed properties are the properties that are defiend on each article's meta data.
					</p>
				</div>
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items: start;" >
					<EditAbleList2 
						collection={ fixedGrp?.collections ?? [] }
						onSelect    	={ (e) => { _colSelect('fixed',e); return true }}
						onAdd       	={ ( ) => { uiSystem.addCollection('fixed') }}
						onUpdateItem	={ (arr)=>{ _colUpdate('fixed', arr ); return true }}
						onDeleteItem	={ (e) => { uiSystem.remCollection('fixed',e.name); if(e.key == derivedCol?.key){ _colSelect('fixed',null)}}} 
						on:onDeSelect	={ ( ) => { _colSelect('fixed',null); }}
					/>
					<EditAbleList2 
						disabled = { fixedCol == null }
						collection={ fixedCol?.nodes ?? [] }
						onSelect    	={ (e) => { _nodSelect('fixed',e); return true }}
						onAdd       	={ ( ) => { uiSystem.addNode('fixed' , fixedCol?.name ?? '' )  }}
						onUpdateItem	={ (arr)=>{ _nodUpdate('fixed', arr ); return true }}
						onDeleteItem	={ (e) => { uiSystem.remNode('fixed',fixedCol?.name ?? '', e.name ); if(e.key == fixedNod?.key){ _nodSelect('fixed',null)} }} 
						on:onDeSelect	={ ( ) => { _nodSelect('fixed',null);}}
					/>
				</div>
				{#if fixedNod }
					{#key fixedNod?.key}
				
						<div transition:slide >
							<FixedItemDesigner 
								bind:this={designerFixed}
								node	= {fixedNod}
								system	= {uiSystem}
								messageHandler = {messageHandler}
								on:save={(e)=>{ 
									const data = e.detail;  
									//system.renameItem('fixed',fixedCol?.name?? '',data.oldName, data.newName);
								}}
							/>
						</div>
					
					{/key}
				{/if}
			</ToogleSection>

			<ToogleSection 
				title="derived"
			>
				<div>
					<h1>Derived Item Design</h1>
					<p>
						Derived properties are the data, that are derived from fixedData
					</p>
				</div>
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items: start;" >
					
						<EditAbleList2 
							collection={ derivedGrp?.collections ?? [] }
							onSelect    	={ (e) => { _colSelect('derived',e); return true }}
							onAdd       	={ ( ) => {  uiSystem.addCollection('derived') }}
							onUpdateItem	={ (arr)=>{ _colUpdate('derived', arr ); return true }}
							onDeleteItem	={ (e) => { uiSystem.remCollection('derived',e.name) ; if(e.key == derivedCol?.key){ _colSelect('derived',null)} }} 
							onSpecialAdd	={ ( ) => { specialOn = !specialOn; }}
							on:onDeSelect	={ ( ) => { _colSelect('derived',null);}}
						/> 
						<EditAbleList2 
							disabled = { derivedCol == null }
							collection={ derivedCol?.nodes ?? [] }
							onSelect    	={ (e) => { 
								_nodSelect('derived',e);
								return true
							}}
							onAdd       	={ ( ) => { uiSystem.addNode('derived' , derivedCol?.name ?? '' )  }}
							onUpdateItem	={ (arr)=>{ _nodUpdate('derived', arr ); return true }}
							onDeleteItem	={ (e) => { uiSystem.remNode('derived',derivedCol?.name ?? '', e.name ); if(e.key == derivedNod?.key){ _nodSelect('derived',null)} }} 
							on:onDeSelect	={ ( ) => { }}
						/> 
				</div>
				{#if derivedNod }
					{#key derivedNod?.key}
				
						<div transition:slide >
							<DerivedItemDesigner 
								bind:this={designerDerived}
								node	= {derivedNod}
								system	= {uiSystem}
								context = {context}
							/>
						</div>
					{/key}
				{/if}
			</ToogleSection>

			<ToogleSection 
				title="Feature Tables"
			>
				<div>
					<h1>Feature Tables</h1>
					<p>
						Tables to Loopup using different values. 
					</p>
				</div>
				<div>
					<FeatureDesigner 
						context={context}
					/>
				</div>
			</ToogleSection>
		</div>
	{/if}
	<!--
	<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;" >
		<EditAbleList2 
			collection={ uiSystem.groups }
			onSelect    	={ (e) => { grpSelect(e); return true }}
			onAdd       	={ ( ) => { return true }}
			onUpdateItem	={ ( ) => { return true }}
			onDeleteItem	={ (e) => { return true }} 
			on:onDeSelect	={ ( ) => { }}
		/>
		<EditAbleList2 
			collection={ grpSel?.collections ?? [] }
			onSelect    	={ (e) => { colSelect(e); return true }}
			onAdd       	={ ( ) => { return true }}
			onUpdateItem	={ ( ) => { return true }}
			onDeleteItem	={ (e) => { return true }} 
			on:onDeSelect	={ ( ) => { }}
		/>
		<EditAbleList2 
			collection={ colSel?.nodes ?? [] }
			onSelect    	={ (e) => { nodSelect(e); return true }}
			onAdd       	={ ( ) => { return true }}
			onUpdateItem	={ ( ) => { return true }}
			onDeleteItem	={ (e) => { return true }} 
			on:onDeSelect	={ ( ) => { }}
		/>


	</div>
	-->

</div>
