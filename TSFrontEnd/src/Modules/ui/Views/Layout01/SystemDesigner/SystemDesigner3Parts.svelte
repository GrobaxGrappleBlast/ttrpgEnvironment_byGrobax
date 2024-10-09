<script lang="ts">
    import { TTRPGSystemJSONFormatting } from "../../../../../../src/Modules/graphDesigner";
    import { UICollection, UIGroup, UINode, UISystem } from "../../../../graphDesigner/UIGraphItems";
    import EditAbleList2 from "../../../../../../src/Modules/ui/Components/editAbleList/EditAbleList2.svelte";
    import ToogleSection from "../../../../../../src/Modules/ui/Components/toogleSection/toogleSection.svelte";
    import { slide } from "svelte/transition";
    import FixedItemDesigner from "./FixedItemDesigner.svelte";
	import StaticMessageHandler from '../../../../../../src/Modules/ui/Components/Messages/StaticMessageHandler.svelte'
    import { writable } from "svelte/store";
    import DerivedItemDesigner from "./DerivedItemDesigner.svelte";
    import { StringFunctions } from "../../../../../../src/Modules/core/BaseFunctions/stringfunctions";

    
    export let system : TTRPGSystemJSONFormatting;
    let uiSystem = new UISystem(system);
	let guidKey = 'designer'+StringFunctions.uuidv4();

	// Generic
	let grpSel : UIGroup		| null = null;
	let colSel : UICollection	| null = null;
	let nodSel : UINode			| null = null;

	function grpSelect( grp :  UIGroup		|null|any){
		colSelect(null);
		grpSel = grp;
	}
	function colSelect( col :  UICollection	|null|any){
		nodSelect(null);
		colSel = col;
	}
	function nodSelect( nod :  UINode		|null|any){
		nodSel = nod;
	}

	// Derived Fixed Logic
	let derivedGrp	= uiSystem.groups.find( p => p.name == 'derived');
	let fixedGrp	= uiSystem.groups.find( p => p.name == 'fixed');

	let derivedCol	: UICollection | null = null;
	let fixedCol	: UICollection | null = null;

	let derivedNod	: UINode | null = null;
	let fixedNod	: UINode | null = null;

	let designerFixed : FixedItemDesigner;
	let designerDerived : DerivedItemDesigner;
	function designerUIUpdate(){
		designerDerived?.forceUpdate();
		designerFixed?.forceUpdate();
	}

	function _colSelect( grp:'derived'|'fixed' ,col :  UICollection	|null|any){
		_nodSelect(grp,null);

		if (grp == 'derived') {
			derivedCol = col;
		}
		else {
			fixedCol = col;
		}
	}
	function _nodSelect( grp:'derived'|'fixed', nod : UINode |null|any){		nodSel = nod;
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

	function _colUpdate	( grp:'derived'|'fixed' , colArr :  UICollection	[]){
		colArr.forEach( n  => {
			if( n.name != n.nameEdit){
				system.renameCollection( grp , n.name, n.nameEdit );
			}
		});
	}
	function _nodUpdate	( grp:'derived'|'fixed' , nodArr :  UINode			[]){
		
		
		let col = grp == 'derived' ? derivedCol : fixedCol;
		if (!col)
			return;

		nodArr.forEach( n  => {
			if(n.name != n.nameEdit){
				system.renameItem( grp , col.name , n.name, n.nameEdit );
			}
		});
	}


	let messageHandler : StaticMessageHandler;

</script>
<div>
	<StaticMessageHandler 
		bind:this={messageHandler}
	/>
	
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
				onAdd       	={ ( ) => { return true }}
				onUpdateItem	={ (arr)=>{ _colUpdate('fixed', arr ); return true }}
				onDeleteItem	={ (e) => { return true }} 
				on:onDeSelect	={ ( ) => { _colSelect('fixed',null); }}
			/>
			<EditAbleList2 
				collection={ fixedCol?.nodes ?? [] }
				onSelect    	={ (e) => { _nodSelect('fixed',e); return true }}
				onAdd       	={ ( ) => { return true }}
				onUpdateItem	={ (arr)=>{ _nodUpdate('fixed', arr ); return true }}
				onDeleteItem	={ (e) => { return true }} 
				on:onDeSelect	={ ( ) => { _nodSelect('fixed',null);}}
			/>
		</div>
		{#if fixedNod}
			<div transition:slide|local >
				<FixedItemDesigner 
					bind:this={designerFixed}
					node	= {fixedNod.link}
					system	= {system}
					on:save={(e)=>{ 
						const data = e.detail;  
						system.renameItem('fixed',fixedCol?.name?? '',data.oldName, data.newName);
					}}
				/>
			</div>
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
					onAdd       	={ ( ) => { return true }}
					onUpdateItem	={ (arr)=>{ _colUpdate('derived', arr ); return true }}
					onDeleteItem	={ (e) => { return true }} 
					on:onDeSelect	={ ( ) => { _colSelect('derived',null);}}
				/> 
				<EditAbleList2 
					collection={ derivedCol?.nodes ?? [] }
					onSelect    	={ (e) => { _nodSelect('derived',e); return true }}
					onAdd       	={ ( ) => { return true }}
					onUpdateItem	={ (arr)=>{ _nodUpdate('derived', arr ); return true }}
					onDeleteItem	={ (e) => { return true }} 
					on:onDeSelect	={ ( ) => { }}
				/> 
		</div>
		{#if derivedNod}
			<div transition:slide|local >
				<DerivedItemDesigner 
					bind:this={designerDerived}
					node	= {derivedNod.link}
					system	= {system}
					on:save={(e)=>{ 
						const data = e.detail;  
						system.renameItem('derived',derivedCol?.name?? '',data.oldName, data.newName);
					}}
				/>
			</div>
		{/if}
	</ToogleSection>

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