<script lang="ts">
    import { TTRPGSystemJSONFormatting } from "../../../../../../src/Modules/graphDesigner";
    import { UICollection, UIGroup, UINode, UISystem } from "./UIGraphItems";
    import EditAbleList2 from "../../../../../../src/Modules/ui/Components/editAbleList/EditAbleList2.svelte";

    
    export let system : TTRPGSystemJSONFormatting;
    let uiSystem = new UISystem(system);

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



</script>
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