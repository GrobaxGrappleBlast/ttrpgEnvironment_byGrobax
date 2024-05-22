<script lang="ts">
    import { GrobDerivedNode, TTRPGSystem} from "../../../../../../../src/Modules/Designer";
   
	import './OriginEditor.scss'
    import OriginRow from "./OriginRow.svelte";

	export let node :GrobDerivedNode;
	export let system:TTRPGSystem;

	let result 	: number | null = NaN;
	let resultSucces : boolean | number = NaN ;
	let calc 	= node.calc;

	function testCalc ( e ){

		let calcValue = e.target.value ;
		let res = node.testCalculate( calcValue );
		result = res.value;
		resultSucces = res.success;
	}

</script>

<div class="OriginEditor">
	<div class="derivedCalcStatementRow" data-succes={resultSucces} >
		<div>Calc</div>
		<input type="text" bind:value={calc} on:input={ (e) => testCalc(e) } placeholder="insert calcStatement here" />
		<div class="derivedCalcStatementResult" data-succes={resultSucces} >{result}</div>
	</div>
	<div class="derivedOriginRowsContainer">
		
		<OriginRow 
			node ={ node }
			system = { system }
			deleteAllowed = {true}
		/>
	</div>
</div>