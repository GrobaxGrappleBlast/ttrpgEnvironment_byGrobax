<script lang="ts">
    import { TTRPGSystemJSONFormatting } from "../../../../../../src/Modules/graphDesigner";
    import { UICollection, UIGroup, UINode, UISystem } from "./UIGraphItems";
    import EditAbleList2 from "../../../../../../src/Modules/ui/Components/editAbleList/EditAbleList2.svelte";
    import ToogleSection from "../../../../../../src/Modules/ui/Components/toogleSection/toogleSection.svelte";

    
    export let system : TTRPGSystemJSONFormatting;
    let uiSystem = new UISystem(system);

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
			derivedNod = nod;
		}
		else {
			fixedNod = nod;
		}
	}

</script>
<div>
	<ToogleSection 
		title="fixed"
	>
		<div>
			<h1>Fixed Item Design</h1>
			<p>
				Fixed properties are the properties that are defiend on each article's meta data.
			</p>
		</div>
		<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;" >
			<EditAbleList2 
				collection={ fixedGrp?.collections ?? [] }
				onSelect    	={ (e) => { _colSelect('fixed',e); return true }}
				onAdd       	={ ( ) => { return true }}
				onUpdateItem	={ ( ) => { return true }}
				onDeleteItem	={ (e) => { return true }} 
				on:onDeSelect	={ ( ) => { }}
			/>
			<EditAbleList2 
				collection={ fixedCol?.nodes ?? [] }
				onSelect    	={ (e) => { _nodSelect('fixed',e); return true }}
				onAdd       	={ ( ) => { return true }}
				onUpdateItem	={ ( ) => { return true }}
				onDeleteItem	={ (e) => { return true }} 
				on:onDeSelect	={ ( ) => { _colSelect('fixed',null);}}
			/>
		</div>
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
		<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;" >
			<EditAbleList2 
				collection={ derivedGrp?.collections ?? [] }
				onSelect    	={ (e) => { _colSelect('derived',e); return true }}
				onAdd       	={ ( ) => { return true }}
				onUpdateItem	={ ( ) => { return true }}
				onDeleteItem	={ (e) => { return true }} 
				on:onDeSelect	={ ( ) => { _colSelect('derived',null);}}
			/>
			<EditAbleList2 
				collection={ derivedCol?.nodes ?? [] }
				onSelect    	={ (e) => { _nodSelect('derived',e); return true }}
				onAdd       	={ ( ) => { return true }}
				onUpdateItem	={ ( ) => { return true }}
				onDeleteItem	={ (e) => { return true }} 
				on:onDeSelect	={ ( ) => { }}
			/>
		</div>
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